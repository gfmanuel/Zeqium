const { Pool } = require('pg');

// Configuración de la conexión a nuestro contenedor Docker
const pool = new Pool({
    user: process.env.DB_USER || 'zeqium',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hotel_db',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
    statement_timeout: 5000,
});

// Función para crear la tabla si no existe al arrancar el servidor
const initDB = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS stays (
            id SERIAL PRIMARY KEY,
            did_huesped VARCHAR(255) NOT NULL,
            nombre VARCHAR(100),
            apellidos VARCHAR(100),
            habitacion VARCHAR(20),
            fecha_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'Checked-in',
            credential_hash VARCHAR(255) NOT NULL
        );
    `;
    let retries = 5;
    while (retries) {
        try {
            await pool.query(queryText);
            console.log('✅ Base de datos del Hotel conectada (Tabla: stays lista)');
            break;
        } catch (err) {
            console.error(`❌ Error conectando a PostgreSQL. Reintentos restantes: ${retries - 1}. Error: ${err.message}`);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

module.exports = { pool, initDB };