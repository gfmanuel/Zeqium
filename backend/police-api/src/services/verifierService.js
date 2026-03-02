const { SDJwtInstance } = require('@sd-jwt/core');
const { digest } = require('@sd-jwt/crypto-nodejs');
const issuerIdentity = require('../config/issuer-identity.json');
const crypto = require('crypto');

class VerifierService {
    constructor() {
        this.sdjwt = new SDJwtInstance({
            verifier: async (input) => {
                if (typeof input !== 'string') {
                    throw new Error('Input al verifier no es string');
                }

                const tildeIndex = input.indexOf('~');
                let jws = tildeIndex !== -1 ? input.substring(0, tildeIndex) : input;

                const parts = jws.split('.');
                if (parts.length !== 3) {
                    throw new Error(`JWS inválido: ${parts.length} partes en lugar de 3`);
                }

                const [headerB64, payloadB64, signatureB64] = parts;
                const signingInput = `${headerB64}.${payloadB64}`;

                const publicKey = crypto.createPublicKey({
                    key: issuerIdentity.publicKeyJWK,
                    format: 'jwk'
                });

                const isValid = crypto.verify(
                    null,
                    Buffer.from(signingInput),
                    publicKey,
                    Buffer.from(signatureB64, 'base64url')
                );

                if (!isValid) {
                    throw new Error('Firma inválida');
                }

                return true;
            },
            hasher: digest,
            hashAlg: 'sha-256'
        });
    }

    async verifyPresentation(sdJwtCombined) {
        const tildeIndex = sdJwtCombined.indexOf('~');
        const jws = tildeIndex !== -1 ? sdJwtCombined.substring(0, tildeIndex) : sdJwtCombined;

        const parts = jws.split('.');
        if (parts.length !== 3) {
            throw new Error(`JWS inválido: ${parts.length} partes`);
        }

        const [headerB64, payloadB64, signatureB64] = parts;
        const signingInput = `${headerB64}.${payloadB64}`;

        const publicKey = crypto.createPublicKey({
            key: issuerIdentity.publicKeyJWK,
            format: 'jwk'
        });

        const signatureBuffer = Buffer.from(signatureB64, 'base64url');

        const isValid = crypto.verify(
            null,
            Buffer.from(signingInput),
            publicKey,
            signatureBuffer
        );

        if (!isValid) {
            throw new Error('Firma inválida (verificación manual)');
        }

        // Parsear payload manualmente
        let payload;
        try {
            const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
            payload = JSON.parse(payloadJson);
        } catch (e) {
            throw new Error('Payload inválido: ' + e.message);
        }

        // Validación de fechas con tolerancia (leeway = 5 minutos)
        const now = Math.floor(Date.now() / 1000);
        const leeway = 300; // 5 minutos en segundos

        if (payload.iat && payload.iat > now + leeway) {
            throw new Error('Token no válido aún (emitido en el futuro)');
        }

        if (payload.exp && payload.exp < now - leeway) {
            throw new Error('Token expirado');
        }

        // Reconstruir claims
        const getStringClaim = (claim) => {
            if (typeof claim === 'string') return claim;
            if (claim && typeof claim === 'object' && !Array.isArray(claim)) {
                return Object.values(claim).join('');
            }
            return claim;
        };

        return {
            iss: payload.iss,
            sub: payload.sub,
            iat: payload.iat,
            exp: payload.exp,
            given_name: getStringClaim(payload.given_name),
            family_name: getStringClaim(payload.family_name),
            birth_date: getStringClaim(payload.birth_date),
            national_id: getStringClaim(payload.national_id),
            nacionalidad: getStringClaim(payload.nacionalidad)
        };
    }
}

module.exports = new VerifierService();