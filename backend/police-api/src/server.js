require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
global.crypto = crypto;
const fs = require('fs');
const path = require('path');

const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');
const issuerService = require('./services/issuerService');
const { pool, initDB } = require('./config/db');

const { authMiddleware, JWT_SECRET } = require('../../shared/src/utils/authMiddleware');
const { ROLES } = require('../../shared/src/constants');
const jwt = require('jsonwebtoken');
const { saveNonce, verifyAndBurnNonce } = require('../../shared/src/utils/nonceManager');

// Validación JSON Schema
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv();
addFormats(ajv);

const app = express();
const PORT = process.env.PORT || 3000;

// --- INICIALIZACIÓN DE IDENTIDAD ---
let ISSUER_PRIVATE_KEY;
let ISSUER_DID = process.env.ISSUER_DID;
try {
  if (!process.env.ISSUER_PRIVATE_KEY_JWK) throw new Error("Falta la clave privada en el .env");
  ISSUER_PRIVATE_KEY = JSON.parse(process.env.ISSUER_PRIVATE_KEY_JWK);
  console.log(`🔐 Identidad de la policía cargada de forma segura: ${ISSUER_DID}`);
} catch (err) {
  console.error("❌ Error: Verifica tu archivo .env. " + err.message);
  process.exit(1);
}

app.use(express.json());

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { user, pass } = req.body;
  if (user === process.env.POLICE_ADMIN_USER && pass === process.env.POLICE_ADMIN_PASS) {
    const token = jwt.sign(
      { id: 1, user: process.env.POLICE_ADMIN_USER, role: ROLES.POLICE_ADMIN },
      JWT_SECRET, { expiresIn: '2h' }
    );
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
});

// ==========================================
// 2. ENDPOINTS PÚBLICOS (Wallet App)
// ==========================================

// Consulta pública de estado (Polling de la App Móvil)
app.get('/api/status/:hash', async (req, res) => {
  try {
    const result = await evaluateTransaction('VerifyCredentialStatus', req.params.hash);
    res.json({ success: true, hash: req.params.hash, status: result.status });
  } catch (err) {
    res.status(404).json({ success: false, error: "Credencial no encontrada en Zeqium" });
  }
});

// ==========================================
// 3. GESTIÓN DEL LEDGER (DIDs, Schemas, CredDefs)
// ==========================================
app.get('/api/did/:id', async (req, res) => {
  try {
    const result = await evaluateTransaction('ResolveDID', req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/did', async (req, res) => {
  try {
    const issuerDid = req.body.id;
    let publicKeyJwk = req.body.pubKey;

    if (!issuerDid || !publicKeyJwk) {
      return res.status(400).json({ error: 'id y pubKey son obligatorios' });
    }

    if (typeof publicKeyJwk === 'string') {
      try {
        publicKeyJwk = JSON.parse(publicKeyJwk);
      } catch (e) {
        return res.status(400).json({ error: 'pubKey debe ser un JWK válido (objeto o JSON stringificable)' });
      }
    }

    const controller = req.body.controller || issuerDid;

    const didDocument = {
      id: issuerDid,
      controller,
      verificationMethod: [
        {
          id: `${issuerDid}#key-1`,
          type: 'JsonWebKey2020',
          controller,
          publicKeyJwk
        }
      ]
    };

    await submitTransaction(
      'RegisterDID',
      issuerDid,
      JSON.stringify(didDocument),
      controller,
      new Date().toISOString()
    );

    res.json({ success: true, id: issuerDid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/schema/:id', async (req, res) => {
  try {
    const result = await evaluateTransaction('GetSchema', req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/issuer/schemas', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  const { schemaID, name, version = "1.0", attributes } = req.body;

  // Validación básica antes de enviar a blockchain
  if (!Array.isArray(attributes) || attributes.some(a => typeof a !== 'string')) {
    return res.status(400).json({
      error: "attributes debe ser un array de strings (nombres de campos)"
    });
  }

  try {
    await submitTransaction(
      'RegisterSchema',
      schemaID,
      name,
      version,
      JSON.stringify(attributes),  // ← se guarda como ["given_name", "birth_date", ...]
      ISSUER_DID
    );
    res.json({ success: true, message: `Esquema ${schemaID} registrado en Zeqium` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ledger/cred-def/:id', async (req, res) => {
  try {
    const result = await evaluateTransaction('GetCredentialDefinition', req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/issuer/credential-definitions', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  const { credDefID, schemaID, publicKeys } = req.body;
  try {
    await submitTransaction('CreateCredentialDefinition', credDefID, schemaID, ISSUER_DID, JSON.stringify(publicKeys));
    res.json({ success: true, message: `Credential Definition ${credDefID} creada` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. FLUJO DE EMISIÓN Y REVOCACIÓN (SSI)
// ==========================================

// Iniciar oferta: Generar nonce para el Handshake QR
app.get('/api/issuer/auth-request', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  try {
    const nonce = crypto.randomBytes(16).toString('hex');
    await saveNonce(nonce, 300); // Caducidad: 5 minutos
    res.json({ success: true, nonce, message: "Escanee este QR para iniciar recepción del DNI" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Emitir Credencial: Validación dinámica y anclaje
app.post('/api/issuer/credential', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  const { userData, holderDID, nonce, schemaID } = req.body;
  const timestamp = new Date().toISOString();

  try {
    // A. Anti-Replay
    if (nonce && !(await verifyAndBurnNonce(nonce))) {
      throw new Error("Nonce inválido o caducado");
    }

    // B. Validación Dinámica de Esquemas (Blockchain -> Ajv)
    const resultFromLedger = await evaluateTransaction('GetSchema', schemaID);
    if (!resultFromLedger) {
      return res.status(404).json({ error: "El esquema no existe en Zeqium" });
    }

    // Log para debug (muy útil ahora)
    console.log('[DEBUG] Schema recibido del ledger:', JSON.stringify(resultFromLedger, null, 2));

    let attributes = resultFromLedger.attributes || [];

    // Normalización robusta
    if (typeof attributes === 'string') {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        console.error('Error parseando attributes string:', e);
        attributes = [];
      }
    }

    // Solo aceptamos array de strings (por chaincode actual)
    if (!Array.isArray(attributes)) {
      return res.status(500).json({
        error: "Formato de atributos inválido en ledger (se esperaba array)"
      });
    }

    // Construimos schemaForAjv de forma muy explícita
    const schemaForAjv = {
      type: "object",
      properties: {},
      required: attributes,          // todos obligatorios por defecto
      additionalProperties: false    // ← evita campos extra (más seguro)
    };

    // Asignamos tipos (por ahora todo string, pero puedes mejorar por campo)
    attributes.forEach(attr => {
      let fieldSchema = { type: "string" };

      // Reglas especiales por nombre de campo (extensible)
      if (attr === "birth_date") {
        fieldSchema.format = "date";           // Ajv con addFormats lo valida
      }
      if (attr === "national_id") {
        fieldSchema.pattern = "^[0-9]{8}[A-Z]$"; // ejemplo DNI español
      }

      schemaForAjv.properties[attr] = fieldSchema;
    });

    const validate = ajv.compile(schemaForAjv);

    // Log del esquema generado (debug)
    console.log('[DEBUG] schemaForAjv generado:', JSON.stringify(schemaForAjv, null, 2));

    if (!validate(userData)) {
      return res.status(400).json({
        error: "Datos inválidos según esquema",
        details: validate.errors
      });
    }

    // C. Criptografía: Generar SD-JWT
    const mappedData = {
      nombre: userData.given_name,
      apellidos: userData.family_name,
      fecha_nacimiento: userData.birth_date,
      dni: userData.national_id,
      nacionalidad: userData.nacionalidad
    };

    const sdJwt = await issuerService.createDNI(mappedData, holderDID);
    const credentialHash = crypto.createHash('sha256').update(sdJwt).digest('hex');

    // D. Anclaje y Persistencia
    await submitTransaction('PublishCredentialStatus', credentialHash, ISSUER_DID, timestamp);
    await pool.query(
      `INSERT INTO issued_credentials (did_holder, credential_hash, estado, national_id) VALUES ($1, $2, $3, $4)`,
      [holderDID, credentialHash, 'ACTIVE', mappedData.dni]
    );

    res.json({
      success: true,
      credential: sdJwt,
      statusHash: credentialHash,
      message: "DNI emitido exitosamente"
    });

  } catch (err) {
    console.error("Error en emisión:", err);
    res.status(500).json({ error: err.message });
  }
});

// Revocación global
app.post('/api/issuer/revoke', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  const { credentialHash, reason } = req.body;
  if (!credentialHash) return res.status(400).json({ error: "Hash obligatorio" });

  try {
    await submitTransaction('RevokeCredential', credentialHash, reason || "USER_REQUEST", new Date().toISOString());
    await pool.query(`UPDATE issued_credentials SET estado = 'REVOKED', fecha_revocacion = CURRENT_TIMESTAMP WHERE credential_hash = $1`, [credentialHash]);
    res.json({ success: true, message: "Credencial revocada", status: "REVOKED", credentialHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. AUDITORÍA E HISTORIAL
// ==========================================
app.get('/api/issuer/history', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM issued_credentials ORDER BY fecha_emision DESC");
    res.json({ success: true, history: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/issuer/audit/log', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  try {
    const auditData = await evaluateTransaction('GetIssuerCredentialHistory', ISSUER_DID);
    res.json({ success: true, audit: auditData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/issuer/audit/export', authMiddleware(ROLES.POLICE_ADMIN), async (req, res) => {
  try {
    const result = await pool.query("SELECT did_holder, credential_hash, estado, fecha_emision, fecha_revocacion, national_id FROM issued_credentials ORDER BY fecha_emision DESC");
    const fields = ['DID Titular', 'Hash Credencial', 'Estado', 'Fecha Emision', 'Fecha Revocacion'];
    const csvRows = result.rows.map(row => `"${row.did_holder}","${row.credential_hash}","${row.estado}","${row.fecha_emision}","${row.fecha_revocacion || 'N/A'}"`);

    res.header('Content-Type', 'text/csv');
    res.attachment('zeqium_police_audit.csv');
    res.send([fields.join(','), ...csvRows].join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
initDB().then(() => {
  app.listen(PORT, () => console.log(`👮 Police Server (Issuer) running on port ${PORT}`));
}).catch(err => console.error("Fallo crítico:", err));