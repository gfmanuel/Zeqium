const { SDJwtInstance } = require('@sd-jwt/core');
const { digest, generateSalt } = require('@sd-jwt/crypto-nodejs');
const crypto = require('crypto');

// Extraemos la identidad desde las variables de entorno (Brecha 1 corregida)
const ISSUER_DID = process.env.ISSUER_DID;
const ISSUER_PRIVATE_KEY_JWK = JSON.parse(process.env.ISSUER_PRIVATE_KEY_JWK);

const signer = async (data) => {
    // Importamos la clave privada Ed25519 desde el formato JWK del .env
    const privateKey = crypto.createPrivateKey({
        key: ISSUER_PRIVATE_KEY_JWK,
        format: 'jwk'
    });

    // Firmamos usando EdDSA (Ed25519) según el estándar definido
    const signature = crypto.sign(
        null,
        Buffer.from(data),
        privateKey
    );

    return signature.toString('base64url');
};

class IssuerService {
    constructor() {
        this.sdjwt = new SDJwtInstance({
            signer,
            signAlg: 'EdDSA', // Algoritmo rápido y seguro para móviles
            hashAlg: 'sha-256',
            hasher: digest,
            saltGenerator: generateSalt
        });
    }

    async createDNI(userData, holderDID) {
        // Estructura de claims según el modelo de datos de Zeqium
        const claims = {
            iss: ISSUER_DID,
            sub: holderDID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365), // Caducidad: 1 año
            given_name: userData.nombre,
            family_name: userData.apellidos,
            birth_date: userData.fecha_nacimiento,
            national_id: userData.dni,
            nacionalidad: userData.nacionalidad
        };

        // Campos divulgables (formato _sd de @sd-jwt; no usar `true` por campo)
        const disclosureFrame = {
            _sd: ['given_name', 'family_name', 'birth_date', 'national_id', 'nacionalidad']
        };

        const encoded = await this.sdjwt.issue(claims, disclosureFrame);

        // Retornamos el formato combinado (JWT + Disclosures)
        return typeof encoded === 'string' ? encoded : encoded.combined;
    }
}

module.exports = new IssuerService();