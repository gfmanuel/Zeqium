const express = require('express');
const { createServer } = require('http'); // Importante para Socket.io
const { Server } = require('socket.io');   // Importante para Socket.io
const crypto = require('crypto');
global.crypto = crypto;

const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');
const verifierService = require('./services/verifierService');
const { pool, initDB } = require('./config/db');
const cron = require('node-cron');

const app = express();
const httpServer = createServer(app); // Creamos el servidor HTTP
const io = new Server(httpServer, {
    cors: { origin: "*" } // Permitimos conexiones desde el futuro frontend
});

const PORT = 3001;
const nonceCache = new Set();

app.use(express.json());

// --- EVENTOS DE SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('📱 Un cliente (frontend) se ha conectado al WebSocket');

    socket.on('disconnect', () => {
        console.log('📱 Cliente desconectado');
    });
});

// --- API DEL HOTEL (Verificador) ---

/**
 * Genera un nonce aleatorio (challenge) para el flujo SSI
 * y lo guarda en caché por 60 segundos para evitar Replay Attacks.
 */
app.get('/api/hotel/auth-request', (req, res) => {
    const nonce = crypto.randomBytes(16).toString('hex');
    nonceCache.add(nonce);

    // El QR/Nonce caduca en 1 minuto
    setTimeout(() => nonceCache.delete(nonce), 60000);

    res.json({
        success: true,
        nonce: nonce,
        message: "Escanea este QR para acceder"
    });
});

/**
 * Proceso de Check-in (Capa 4 + Capa 5)
 */
app.post('/api/hotel/checkin', async (req, res) => {
    let { sdJwt, nonce, isBase64 = false } = req.body;
    const timestamp = new Date().toISOString();

    try {
        // 1. Seguridad: Validación del Nonce (Anti-Replay)
        if (!nonce || !nonceCache.has(nonce)) {
            throw new Error('Nonce inválido, caducado o ya utilizado');
        }
        nonceCache.delete(nonce);

        if (isBase64) {
            sdJwt = Buffer.from(sdJwt, 'base64').toString('utf8');
        }

        // 2. Criptografía: Validar firma SD-JWT y extraer claims
        const payload = await verifierService.verifyPresentation(sdJwt);
        const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');

        // 3. Blockchain: Consultar estado de revocación en Zeqium
        const statusResult = await evaluateTransaction('VerifyCredentialStatus', credentialHash);
        if (statusResult?.status !== 'ACTIVE') {
            throw new Error('Credencial no activa o revocada en la red Zeqium');
        }

        // 4. Lógica de Negocio: Evitar check-in si ya tiene estancia activa
        const checkActiveQuery = `
            SELECT id, habitacion FROM stays 
            WHERE did_huesped = $1 AND estado = 'Checked-in'
        `;
        const activeStay = await pool.query(checkActiveQuery, [payload.sub]);

        if (activeStay.rowCount > 0) {
            return res.status(400).json({
                success: false,
                error: `El usuario ya tiene una estancia activa en la habitación ${activeStay.rows[0].habitacion}.`
            });
        }

        // 5. Blockchain: Registrar actividad de verificación (Audit Log)
        const auditId = 'LOG_' + crypto.randomBytes(4).toString('hex');
        await submitTransaction('LogVerificationActivity', auditId, timestamp, 'did:zeqium:hotel_madrid_01', credentialHash);

        // 6. DB Local: Asignar habitación y registrar huésped
        const numeroHabitacion = Math.floor(Math.random() * 100) + 100;
        const insertQuery = `
            INSERT INTO stays (did_huesped, nombre, apellidos, habitacion, credential_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, habitacion;
        `;

        const dbResult = await pool.query(insertQuery, [
            payload.sub,
            payload.given_name,
            payload.family_name,
            `Hab-${numeroHabitacion}`,
            credentialHash
        ]);

        const habitacionAsignada = dbResult.rows[0].habitacion;

        // --- NUEVO: 7. Emitir evento en tiempo real vía WebSocket ---
        io.emit('new-checkin', {
            nombre: payload.given_name,
            apellidos: payload.family_name,
            habitacion: habitacionAsignada,
            hora: new Date().toLocaleTimeString(),
            auditId: auditId
        });

        // 8. Respuesta final al móvil
        res.json({
            success: true,
            message: "¡DNI verificado! Bienvenido al hotel.",
            user_checked_in: {
                nombre: payload.given_name,
                apellidos: payload.family_name,
                nacionalidad: payload.nacionalidad,
                habitacion: habitacionAsignada
            },
            verification_time: new Date().toISOString(),
            auditId: auditId,
            credentialHash: credentialHash
        });

    } catch (err) {
        console.error("Fallo en verificación:", err.message);
        res.status(401).json({
            error: "Fallo en la verificación: " + (err.message || 'Error desconocido')
        });
    }
});

// --- TAREA PROGRAMADA (Cron Job) ---
cron.schedule('* * * * *', async () => {
    try {
        const updateQuery = `
            UPDATE stays 
            SET estado = 'Completed' 
            WHERE estado = 'Checked-in' 
            AND fecha_entrada < NOW() - INTERVAL '1 minute'
            RETURNING id, nombre;
        `;

        const result = await pool.query(updateQuery);

        if (result.rowCount > 0) {
            result.rows.forEach(row => {
                console.log(`✅ [Cron Job] Check-out automático realizado para: ${row.nombre} (ID: ${row.id})`);
            });
        }
    } catch (err) {
        console.error('❌ [Cron Job] Error al procesar check-outs:', err.message);
    }
});

// --- ARRANQUE DEL SERVIDOR ---
initDB().then(() => {
    // IMPORTANTE: Escuchamos con httpServer en lugar de app
    httpServer.listen(PORT, () => {
        console.log(`Hotel Server (Verifier) with WebSockets listening on port ${PORT}`);
    });
}).catch(err => {
    console.error("Fallo crítico al arrancar la BD:", err);
});