const express = require('express');
const { evaluateTransaction, submitTransaction } = require('./controllers/fabricController');

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});