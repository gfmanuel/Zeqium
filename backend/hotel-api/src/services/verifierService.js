const { SDJwtInstance } = require('@sd-jwt/core');
const { digest } = require('@sd-jwt/crypto-nodejs');
const crypto = require('crypto');
const { evaluateTransaction } = require('../controllers/fabricController');

class VerifierService {
    constructor() {
        this.sdjwt = new SDJwtInstance({
            /**
             * El verifier de la librería nos entrega el signingInput y la firma.
             * Solo tenemos que validar la criptografía usando la clave de Fabric.
             */
            verifier: async (signingInput, signature, header) => {
                // 1. Extraemos el payload para saber quién es el emisor (iss)
                const payloadB64 = signingInput.split('.')[1];
                const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

                // 2. Capa 5: Resolver DID inmutable desde la Blockchain [cite: 307, 308]
                const didDocResult = await evaluateTransaction('ResolveDID', payload.iss);
                const didDocument = (typeof didDocResult === 'string') ? JSON.parse(didDocResult) : didDocResult;

                // La blockchain guarda el objeto JWK serializado dentro del campo publicKeyMultibase
                const verificationMethodWrapper = JSON.parse(didDocument.publicKeyMultibase);

                // Extraemos la clave pública de la estructura anidada generada en el registro
                const publicKeyJWK = verificationMethodWrapper.verificationMethod[0].publicKeyJwk.publicKeyJwk || verificationMethodWrapper.verificationMethod[0].publicKeyJwk;

                // 3. Verificación matemática de la firma Ed25519 [cite: 33, 374]
                const publicKey = crypto.createPublicKey({ key: publicKeyJWK, format: 'jwk' });
                return crypto.verify(null, Buffer.from(signingInput), publicKey, Buffer.from(signature, 'base64url'));
            },
            hasher: digest,
            hashAlg: 'sha-256' // Estándar definido en Capa 1 [cite: 36]
        });
    }

    async verifyPresentation(sdJwtCombined) {
        /**
         * sdjwt.verify realiza automáticamente:
         * - Validación de la firma del emisor.
         * - Verificación de cada Disclosure (hash SHA-256 + salt). [cite: 36, 56]
         * - Reconstrucción de los claims revelados. [cite: 11]
         */
        const { payload } = await this.sdjwt.verify(sdJwtCombined, {
            expectedIssuer: process.env.ISSUER_DID || "did:zeqium:admin"
        });

        // Validación extra de caducidad con margen de maniobra [cite: 18, 286]
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < (now - 300)) {
            throw new Error("La credencial ha caducado en la red Zeqium");
        }

        return payload; // Retorna solo los campos que el usuario decidió compartir [cite: 24, 26]
    }
}

module.exports = new VerifierService();