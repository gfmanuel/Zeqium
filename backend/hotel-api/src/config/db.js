const { Pool } = require('pg');

// Configuración de la conexión a nuestro contenedor Docker
const pool = new Pool({
    user: 'zeqium',
    host: 'localhost',
    database: 'hotel_db',
    password: 'admin',
    port: 5432,
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
    try {
        await pool.query(queryText);
        console.log('✅ Base de datos del Hotel conectada (Tabla: stays lista)');
    } catch (err) {
        console.error('❌ Error conectando a PostgreSQL:', err.message);
    }
};

module.exports = { pool, initDB };