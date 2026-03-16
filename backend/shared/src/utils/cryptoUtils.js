/**
 * Descifra un mensaje JWE enviado por la App móvil
 */
async function decryptJWE(jweCompact, privateKeyJWK) {
    try {
        // 1. Usamos importación dinámica como exige 'jose' v5 en entornos CommonJS
        const { compactDecrypt, importJWK } = await import('jose');

        // 2. Importamos la clave privada (Asegúrate de que 'ECDH-ES' coincide con la curva de tu JWK, ej: X25519)
        const privateKey = await importJWK(privateKeyJWK, 'ECDH-ES');

        // 3. Desciframos el paquete JWE compacto
        const { plaintext } = await compactDecrypt(jweCompact, privateKey);

        // 4. Convertimos el Uint8Array resultante a String y luego a JSON
        const decodedString = new TextDecoder().decode(plaintext);
        return JSON.parse(decodedString);

    } catch (err) {
        console.error("[CRYPTO ERROR] Fallo interno en descifrado JWE:", err);
        throw new Error('Fallo al descifrar el paquete JWE: ' + err.message);
    }
}

module.exports = { decryptJWE };