/**
 * Descifra un mensaje JWE enviado por la App móvil
 */
async function decryptJWE(jweCompact, privateKeyJWK) {
    try {
        const { compactDecrypt, importJWK } = require('jose');

        // Importamos la clave privada asegurando el algoritmo correcto para la curva
        const privateKey = await importJWK(privateKeyJWK, 'ECDH-ES');

        // Desciframos el paquete JWE compacto
        const { plaintext } = await compactDecrypt(jweCompact, privateKey);

        // Convertimos el Uint8Array a String y luego a JSON
        const decodedString = new TextDecoder().decode(plaintext);
        return JSON.parse(decodedString);

    } catch (err) {
        console.error("[CRYPTO ERROR] Fallo interno en descifrado JWE:", err);
        throw new Error('Fallo al descifrar el paquete JWE: ' + err.message);
    }
}

module.exports = { decryptJWE };