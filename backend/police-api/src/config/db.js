const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'zeqium',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'police_db',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5433,
});

const initDB = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS issued_credentials (
            id SERIAL PRIMARY KEY,
            did_holder VARCHAR(255) NOT NULL,
            credential_hash VARCHAR(255) UNIQUE NOT NULL,
            fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_revocacion TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'ACTIVE'
        );
    `;
    try {
        await pool.query(queryText);
        console.log('👮 Base de datos de la Policía conectada (Tabla: issued_credentials lista)');
    } catch (err) {
        console.error('❌ Error conectando a PostgreSQL (Policía):', err.message);
    }
};

module.exports = { pool, initDB };