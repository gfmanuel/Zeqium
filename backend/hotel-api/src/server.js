const express = require('express');
const crypto = require('crypto');
global.crypto = crypto;
const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');
const verifierService = require('./services/verifierService');
const nonceCache = new Set();

const app = express();
const PORT = 3001; // ¡Puerto del hotel!

app.use(express.json());

// --- API DEL HOTEL (Verificador) ---

app.get('/api/hotel/auth-request', (req, res) => {
    const nonce = crypto.randomBytes(16).toString('hex');
    nonceCache.add(nonce);
    setTimeout(() => nonceCache.delete(nonce), 60000);

    res.json({
        success: true,
        nonce: nonce,
        message: "Escanea este QR para acceder"
    });
});

app.post('/api/hotel/checkin', async (req, res) => {
    let { sdJwt, nonce, isBase64 = false } = req.body;
    const timestamp = new Date().toISOString();

    try {
        if (!nonce || !nonceCache.has(nonce)) {
            throw new Error('Nonce inválido, caducado o ya utilizado (Ataque de repetición evitado)');
        }
        nonceCache.delete(nonce);

        if (isBase64) {
            sdJwt = Buffer.from(sdJwt, 'base64').toString('utf8');
        }

        if (!sdJwt || typeof sdJwt !== 'string' || sdJwt.length < 100) {
            throw new Error('Token inválido o demasiado corto');
        }

        const payload = await verifierService.verifyPresentation(sdJwt);
        const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');
        const statusResult = await evaluateTransaction('VerifyCredentialStatus', credentialHash);

        if (statusResult?.status !== 'ACTIVE') {
            throw new Error('Credencial no activa o revocada en blockchain');
        }

        const auditId = 'LOG_' + crypto.randomBytes(4).toString('hex');
        await submitTransaction('LogVerificationActivity', auditId, timestamp, 'did:zeqium:hotel_madrid_01', credentialHash);

        res.json({
            success: true,
            message: "¡DNI verificado! Bienvenido al hotel.",
            user_checked_in: {
                nombre: payload.given_name,
                apellidos: payload.family_name,
                nacionalidad: payload.nacionalidad
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

app.listen(PORT, () => {
    console.log(`Hotel Server (Verifier) listening on port ${PORT}`);
});