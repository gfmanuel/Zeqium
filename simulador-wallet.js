const fs = require('fs');
const readline = require('readline');

// Polyfill para crypto en versiones antiguas de Node
const crypto = require('crypto');
if (!globalThis.crypto) globalThis.crypto = crypto.webcrypto;

const URL_HOTEL = 'http://localhost/api/hotel';

// Clave pública X25519 del Hotel (Destinatario del JWE)
const HOTEL_PUBLIC_KEY_JWK = {
    crv: 'X25519',
    x: '8PoTpF9Cw0hdn4FNsnDXv_i8wUQGif50NClQf7QFhn8',
    kty: 'OKP'
};

async function encryptAsJWE(payload, publicKeyJWK) {
    const { CompactEncrypt, importJWK } = await import('jose');
    const publicKey = await importJWK(publicKeyJWK, 'ECDH-ES');

    // Convertir el JSON payload a UInt8Array
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));

    // Cifrar con curvas elípticas
    const jwe = await new CompactEncrypt(plaintext)
        .setProtectedHeader({ alg: 'ECDH-ES', enc: 'A256GCM', kid: 'hotel-key' })
        .encrypt(publicKey);

    return jwe;
}

async function simularWallet() {
    console.log("📱 ===============================================");
    console.log("📱    SIMULADOR DE WALLET MÓVIL DEL CIUDADANO      ");
    console.log("📱 ===============================================");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("\n📝 Pega aquí tu CREDENCIAL (SD-JWT) obtenida en la web de la Policía:\n> ", async (sdJwt) => {
        sdJwt = sdJwt.trim();
        if (!sdJwt.includes("eyJ")) {
            console.error("❌ Eso no parece un JWT válido.");
            process.exit(1);
        }

        console.log("\n⏳ 1. Leyendo QR del Hotel (solicitando 'Presentation Request')...");
        try {
            const authReqRes = await fetch(`${URL_HOTEL}/hotel/auth-request`);
            const authReq = await authReqRes.json();

            if (!authReq.request || !authReq.request.body.nonce) {
                throw new Error("No se pudo obtener el nonce del hotel");
            }
            const hotelNonce = authReq.request.body.nonce;
            console.log(`✅ QR leído. Nonce del hotel: ${hotelNonce}`);

            console.log("\n🔐 2. Cifrando credencial para garantizar privacidad (JWE)...");
            const jwe = await encryptAsJWE({ sdJwt: sdJwt }, HOTEL_PUBLIC_KEY_JWK);
            console.log(`✅ Credencial empaquetada de forma segura.`);

            console.log("\n🚀 3. Enviando credencial al hotel (Check-in)...");
            const checkinRes = await fetch(`${URL_HOTEL}/hotel/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jwe: jwe, nonce: hotelNonce })
            });

            const checkinData = await checkinRes.json();

            if (checkinRes.ok) {
                console.log("\n🎉 ¡CHECK-IN SUPERADO CON ÉXITO!");
                console.log("-----------------------------------------");
                console.log(`👤 Huésped:   ${checkinData.user_checked_in.nombre}`);
                console.log(`🚪 Habitación:${checkinData.user_checked_in.habitacion}`);
                console.log(`🆔 DID:       ${checkinData.user_checked_in.did}`);
                console.log("-----------------------------------------");
                console.log("\n👁️  Ahona abre la Web del Hotel, ve a 'Huéspedes Activos' y te verás allí reflejado.");
            } else {
                console.error("\n❌ ERROR DE CHECK-IN RECHAZADO POR EL HOTEL:");
                console.error(checkinData.error || checkinData.message || JSON.stringify(checkinData));
            }

        } catch (e) {
            console.error("\n❌ ERROR FATAL:", e.message);
        } finally {
            rl.close();
            process.exit(0);
        }
    });
}

simularWallet();
