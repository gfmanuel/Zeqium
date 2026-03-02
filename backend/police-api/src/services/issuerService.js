const { SDJwtInstance } = require('@sd-jwt/core');
const { digest, generateSalt } = require('@sd-jwt/crypto-nodejs');
const issuerIdentity = require('../config/issuer-identity.json');

async function getJose() {
    return await import('jose');
}
const crypto = require('crypto');

const signer = async (data) => {

    const privateKey = crypto.createPrivateKey({
        key: issuerIdentity.privateKeyJWK,
        format: 'jwk'
    });

    // data YA es el signing input correcto
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
            signAlg: 'EdDSA',
            hashAlg: 'sha-256',
            hasher: digest,
            saltGenerator: generateSalt
        });
    }

    async createDNI(userData, holderDID) {
        const claims = {
            iss: issuerIdentity.did,
            sub: holderDID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
            given_name: userData.nombre,
            family_name: userData.apellidos,
            birth_date: userData.fecha_nacimiento,
            national_id: userData.dni,
            nacionalidad: userData.nacionalidad
        };

        const disclosureFrame = {
            given_name: true,
            family_name: true,
            birth_date: true,
            national_id: true,
            nacionalidad: true
        };

        const encoded = await this.sdjwt.issue(claims, disclosureFrame);
        return typeof encoded === 'string' ? encoded : encoded.combined;
    }
}

module.exports = new IssuerService();