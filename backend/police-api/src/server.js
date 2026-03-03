const express = require('express');
const crypto = require('crypto');
global.crypto = crypto;
const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');
const issuerService = require('./services/issuerService');
const { pool, initDB } = require('./config/db');
const app = express();
const PORT = 3000;

app.use(express.json());

// --- API DE LA POLICÍA (Emisor) ---

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

// --- Credenciales ---
app.post('/api/issuer/credential', async (req, res) => {
  const { userData, holderDID } = req.body;
  const timestamp = new Date().toISOString();

  try {
    // 1. Generar la VC firmada con SD-JWT (Off-chain)
    const sdJwt = await issuerService.createDNI(userData, holderDID);

    // 2. Calcular el Hash SHA-256 del documento
    const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');

    // 3. Anclar el estado en la Blockchain
    await submitTransaction('PublishCredentialStatus', credentialHash, 'did:zeqium:admin', timestamp);

    const insertQuery = `
      INSERT INTO issued_credentials (did_holder, credential_hash, estado)
      VALUES ($1, $2, $3)
    `;
    await pool.query(insertQuery, [holderDID, credentialHash, 'ACTIVE']);

    res.json({
      success: true,
      credential: sdJwt,
      statusHash: credentialHash,
      message: "DNI emitido y anclado en Zeqium con éxito"
    });
  } catch (err) {
    console.error("DETALLE DEL ERROR:", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack?.split('\n')[0]
    });
  }
});

app.post('/api/issuer/revoke', async (req, res) => {
  const { credentialHash, reason } = req.body;
  const timestamp = new Date().toISOString();

  if (!credentialHash) {
    return res.status(400).json({ error: "El credentialHash es obligatorio" });
  }

  try {
    await submitTransaction('RevokeCredential', credentialHash, reason || "USER_REQUEST", timestamp);

    const updateQuery = `
      UPDATE issued_credentials 
      SET estado = 'REVOKED', fecha_revocacion = CURRENT_TIMESTAMP
      WHERE credential_hash = $1
    `;
    await pool.query(updateQuery, [credentialHash]);

    res.json({
      success: true,
      message: "Credencial revocada con éxito en Zeqium",
      status: "REVOKED",
      credentialHash,
      updatedAt: timestamp
    });
  } catch (err) {
    res.status(500).json({ error: "Fallo al revocar: " + err.message });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Police Server (Issuer) listening on port ${PORT}`);
  });
}).catch(err => {
  console.error("Fallo crítico al arrancar la BD de la policía:", err);
});