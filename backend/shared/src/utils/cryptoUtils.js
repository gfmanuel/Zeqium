/**
 * Descifra un mensaje JWE enviado por la App móvil
 */
async function decryptJWE(jwe, privateKeyJWK) {
    try {
        // Usamos importación dinámica para soportar la última versión de 'jose'
        const { compactDecrypt, importJWK } = await import('jose');

        // Importamos la clave privada
        const privateKey = await importJWK(privateKeyJWK, 'X25519');

        // Desciframos el paquete
        const { plaintext } = await compactDecrypt(jwe, privateKey);

        // Convertimos el buffer a objeto JSON
        const decoded = new TextDecoder().decode(plaintext);
        return JSON.parse(decoded);
    } catch (err) {
        throw new Error('Fallo al descifrar el paquete JWE: ' + err.message);
    }
}

module.exports = { decryptJWE };