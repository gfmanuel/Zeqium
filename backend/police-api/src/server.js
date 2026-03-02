const express = require('express');
const crypto = require('crypto');
global.crypto = crypto;
const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');
const issuerService = require('./services/issuerService');
const verifierService = require('./services/verifierService');

const app = express();
const PORT = 3000;

app.use(express.json());

// --- DIDs ---
app.get('/api/did/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await evaluateTransaction('ResolveDID', id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/did', async (req, res) => {
  const { id, pubKey, controller } = req.body;
  const timestamp = new Date().toISOString();

  try {
    await submitTransaction('RegisterDID', id, pubKey, controller, timestamp);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// --- Esquemas ---
app.get('/api/schema/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await evaluateTransaction('GetSchema', id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/schema', async (req, res) => {
  const { schemaId, name, version, attributes, issuerDID } = req.body;

  try {
    const attributesJSON = JSON.stringify(attributes);
    await submitTransaction('RegisterSchema', schemaId, name, version, attributesJSON, issuerDID);
    res.json({ success: true, schemaId });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/issuer/credential', async (req, res) => {
  const { userData, holderDID } = req.body;
  const timestamp = new Date().toISOString();

  try {
    // 1. Generar la VC firmada con SD-JWT (Off-chain) [cite: 334, 676]
    const sdJwt = await issuerService.createDNI(userData, holderDID);

    // 2. Calcular el Hash SHA-256 del documento [cite: 347, 117]
    const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');

    // 3. Anclar el estado en la Blockchain (Capa 5) [cite: 676, 268]
    // Usamos la función de tu chaincode en Go: PublishCredentialStatus
    await submitTransaction('PublishCredentialStatus', credentialHash, 'did:zeqium:admin', timestamp);

    // 4. Devolver la credencial al usuario (Holder) [cite: 676]
    res.json({
      success: true,
      credential: sdJwt, // Esto es lo que el móvil guarda en su base de datos local [cite: 429]
      statusHash: credentialHash,
      message: "DNI emitido y anclado en Zeqium con éxito"
    });
  } catch (err) {
    console.error("DETALLE DEL ERROR:", err); // Esto saldrá en tu terminal negra
    res.status(500).json({
      error: err.message,
      stack: err.stack?.split('\n')[0] // Esto nos dirá la línea exacta del fallo
    });
  }
});

app.post('/api/hotel/checkin', async (req, res) => {
  let { sdJwt, isBase64 = false } = req.body;
  const timestamp = new Date().toISOString();

  try {
    // Si viene como base64, decodificarlo
    if (isBase64) {
      sdJwt = Buffer.from(sdJwt, 'base64').toString('utf8');
    }

    // Validación básica
    if (!sdJwt || typeof sdJwt !== 'string' || sdJwt.length < 100) {
      throw new Error('Token inválido o demasiado corto');
    }

    // 1. Validar firma y obtener payload
    const payload = await verifierService.verifyPresentation(sdJwt);

    // 2. Calcular hash
    const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');

    // 3. Consultar estado en blockchain
    const statusResult = await evaluateTransaction('VerifyCredentialStatus', credentialHash);

    // Validar que esté activa (adapta según lo que devuelva tu chaincode)
    if (statusResult?.status !== 'ACTIVE') {
      throw new Error('Credencial no activa o revocada en blockchain');
    }

    // 4. Registrar auditoría
    const auditId = 'LOG_' + crypto.randomBytes(4).toString('hex');
    await submitTransaction('LogVerificationActivity', auditId, timestamp, 'did:zeqium:hotel_madrid_01', credentialHash);

    // Respuesta limpia y útil
    res.json({
      success: true,
      message: "¡DNI verificado! Bienvenido al hotel.",
      user_checked_in: {
        nombre: payload.given_name,
        apellidos: payload.family_name,      // ← añadido
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
  console.log(`Server listening on port ${PORT}`);
});