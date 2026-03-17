require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
global.crypto = crypto;
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');
const verifierService = require('./services/verifierService');
const { pool, initDB } = require('./config/db');

const jwt = require('jsonwebtoken');
const { authMiddleware, JWT_SECRET } = require('../../shared/src/utils/authMiddleware');
const { ROLES } = require('../../shared/src/constants');
const { saveNonce, verifyAndBurnNonce } = require('../../shared/src/utils/nonceManager');
const { decryptJWE } = require('../../shared/src/utils/cryptoUtils');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3001;

// --- INICIALIZACIÓN DE IDENTIDAD ---
let HOTEL_PRIVATE_KEY;
try {
    if (!process.env.HOTEL_PRIVATE_KEY_JWK) throw new Error("Falta la clave privada en el .env");
    HOTEL_PRIVATE_KEY = JSON.parse(process.env.HOTEL_PRIVATE_KEY_JWK);
    console.log(`🔐 Identidad del hotel cargada de forma segura: ${process.env.HOTEL_DID}`);
} catch (err) {
    console.error("❌ Error: Verifica tu archivo .env. " + err.message);
    process.exit(1);
}

app.use(express.json());

io.on('connection', (socket) => {
    console.log('📱 Cliente WebSocket conectado');
    socket.on('disconnect', () => console.log('📱 Cliente WebSocket desconectado'));
});

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === process.env.HOTEL_ADMIN_USER && pass === process.env.HOTEL_ADMIN_PASS) {
        const token = jwt.sign(
            { id: 2, user: process.env.HOTEL_ADMIN_USER, role: ROLES.HOTEL_RECEPTIONIST },
            JWT_SECRET, { expiresIn: '4h' }
        );
        return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, message: 'Credenciales de hotel incorrectas' });
});

// ==========================================
// 2. FLUJO DE VERIFICACIÓN (SSI / DIDComm)
// ==========================================

app.get('/api/hotel/auth-request', async (req, res) => {
    try {
        const nonce = crypto.randomBytes(16).toString('hex');
        await saveNonce(nonce, 60); // Caducidad de 60s [cite: 232]

        const now = Math.floor(Date.now() / 1000);

        // Objeto oficial DIF Presentation Exchange v2.0 [cite: 60-87]
        const presentationRequest = {
            type: "PresentationRequest",
            id: `req_${crypto.randomBytes(4).toString('hex')}`,
            from: process.env.HOTEL_DID,
            created_time: now,
            expires_time: now + 60,
            body: {
                goal_code: "hotel_checkin",
                nonce: nonce,
                requirements: [{
                    schema: "schema:zeqium:gov:dni:v1",
                    constraints: {
                        fields: [
                            { path: ["$.national_id"], filter: { type: "string" } },
                            { path: ["$.birth_date"], filter: { type: "string", maximum: "2008-03-03" } }
                        ]
                    }
                }]
            }
        };

        res.json({ success: true, request: presentationRequest });
    } catch (err) {
        res.status(500).json({ error: "Error 503: Servicio temporalmente no disponible" });
    }
});

app.post('/api/hotel/checkin', async (req, res) => {
    const { jwe, nonce } = req.body;
    const timestamp = new Date().toISOString();

    try {
        // A. Anti-Replay [cite: 247, 324]
        const isValidNonce = await verifyAndBurnNonce(nonce);
        if (!isValidNonce) throw new Error('Nonce inválido, caducado o ya utilizado');

        // B. Privacidad: Descifrar JWE [cite: 246]
        const decryptedPayload = await decryptJWE(jwe, HOTEL_PRIVATE_KEY);
        const sdJwt = decryptedPayload.sdJwt;

        // C. Criptografía: Validar firma SD-JWT [cite: 262]
        const rawPayload = await verifierService.verifyPresentation(sdJwt);
        const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');

        // Helper para reconvertir valores disgregados a strings
        const normalizeClaim = (claim) => {
            if (!claim) return claim;
            if (typeof claim === 'string') return claim;
            if (typeof claim === 'object') {
                return Object.values(claim).join(''); // {"0":"C","1":"a"} -> "Ca"
            }
            return String(claim);
        };

        const payload = {
            sub: rawPayload.sub,
            national_id: normalizeClaim(rawPayload.national_id),
            birth_date: normalizeClaim(rawPayload.birth_date),
            given_name: normalizeClaim(rawPayload.given_name),
            family_name: normalizeClaim(rawPayload.family_name)
        };

        // --- VALIDACIÓN DE CONSTRAINTS (DIF PE) --- [cite: 29, 332]
        const requiredFields = ['national_id', 'birth_date', 'given_name', 'family_name'];
        const missingFields = requiredFields.filter(field => !payload[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Divulgación insuficiente. Faltan campos requeridos: ${missingFields.join(', ')}`
            });
        }

        // Validación de regla: Mayor de edad (2008-03-03) [cite: 85-87]
        const birthDate = new Date(payload.birth_date);
        const limitDate = new Date('2008-03-03');
        if (birthDate > limitDate) {
            return res.status(403).json({
                success: false,
                error: "Acceso denegado: El usuario no cumple el requisito de mayoría de edad."
            });
        }

        // D. Gobernanza: Consultar estado en Zeqium [cite: 270, 344]
        const statusResult = await evaluateTransaction('VerifyCredentialStatus', credentialHash);
        if (statusResult?.status !== 'ACTIVE') throw new Error('Credencial no activa o revocada');

        // E. Negocio: Evitar múltiples check-ins [cite: 273]
        const activeStay = await pool.query(`SELECT id FROM stays WHERE did_huesped = $1 AND estado = 'Checked-in'`, [payload.sub]);
        if (activeStay.rowCount > 0) return res.status(400).json({ success: false, error: 'El usuario ya tiene una estancia activa.' });

        // F. Trazabilidad: Registrar auditoría en Fabric [cite: 378]
        const auditId = 'LOG_' + crypto.randomBytes(4).toString('hex');
        await submitTransaction('LogVerificationActivity', auditId, timestamp, process.env.HOTEL_DID, credentialHash);

        // G. Persistencia [cite: 273]
        const habitacionAsignada = `Hab-${Math.floor(Math.random() * 100) + 100}`;
        await pool.query(
            `INSERT INTO stays (did_huesped, nombre, apellidos, habitacion, credential_hash) VALUES ($1, $2, $3, $4, $5)`,
            [payload.sub, payload.given_name, payload.family_name, habitacionAsignada, credentialHash]
        );

        // H. Notificación [cite: 279, 314]
        io.emit('new-checkin', {
            nombre: payload.given_name, apellidos: payload.family_name, habitacion: habitacionAsignada, hora: new Date().toLocaleTimeString(), auditId
        });

        res.json({ success: true, message: "¡DNI verificado!", user_checked_in: { nombre: payload.given_name, habitacion: habitacionAsignada }, auditId });
    } catch (err) {
        console.error("Fallo en verificación:", err.message);
        res.status(401).json({ error: "Fallo en la verificación: " + err.message });
    }
});

// ==========================================
// 3. GESTIÓN OPERATIVA
// ==========================================
app.get('/api/hotel/guests/active', authMiddleware(ROLES.HOTEL_RECEPTIONIST), async (req, res) => {
    try {
        const result = await pool.query("SELECT id, nombre, apellidos, habitacion, fecha_entrada, estado FROM stays WHERE estado = 'Checked-in' ORDER BY fecha_entrada DESC");
        res.json({ success: true, guests: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar huéspedes: ' + err.message });
    }
});

// ==========================================
// 4. AUDITORÍA Y TRAZABILIDAD
// ==========================================
app.get('/api/hotel/audit/logs', authMiddleware(ROLES.HOTEL_RECEPTIONIST), async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM stays ORDER BY fecha_entrada DESC");
        res.json({ success: true, logs: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/hotel/audit/ledger', authMiddleware(ROLES.HOTEL_RECEPTIONIST), async (req, res) => {
    try {
        const resultBuffer = await evaluateTransaction('GetAuditLogs', process.env.HOTEL_DID);
        res.json({ success: true, ledger: JSON.parse(resultBuffer.toString()) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/hotel/audit/export', authMiddleware(ROLES.HOTEL_RECEPTIONIST), async (req, res) => {
    try {
        const result = await pool.query("SELECT did_huesped, nombre, apellidos, habitacion, fecha_entrada, fecha_salida_prevista, estado, credential_hash FROM stays ORDER BY fecha_entrada DESC");
        const fields = ['DID Huesped', 'Nombre', 'Apellidos', 'Habitacion', 'Entrada', 'Salida Prevista', 'Estado', 'Hash Verificado'];
        const csvRows = result.rows.map(row =>
            `"${row.did_huesped}","${row.nombre}","${row.apellidos}","${row.habitacion}","${row.fecha_entrada}","${row.fecha_salida_prevista || 'N/A'}","${row.estado}","${row.credential_hash}"`
        );

        res.header('Content-Type', 'text/csv');
        res.attachment('zeqium_hotel_stays.csv');
        return res.send([fields.join(','), ...csvRows].join('\n'));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CRON JOBS ---
cron.schedule('* * * * *', async () => {
    try {
        const query = `UPDATE stays SET estado = 'Completed' WHERE estado = 'Checked-in' AND fecha_entrada < NOW() - INTERVAL '1 minute' RETURNING id, nombre;`;
        const result = await pool.query(query);
        result.rows.forEach(row => console.log(`✅ [Cron Job] Check-out realizado: ${row.nombre}`));
    } catch (err) {
        console.error('❌ [Cron Job] Error:', err.message);
    }
});

initDB().then(() => {
    httpServer.listen(PORT, () => console.log(`🏨 Hotel Server (Verifier) running on port ${PORT}`));
}).catch(err => console.error("Fallo crítico:", err));