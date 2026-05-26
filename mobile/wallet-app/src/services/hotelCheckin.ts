import type { CheckinResult, QRPayload } from '../types/presentation';
import { buildSelectivePresentation } from './sdjwtPresentation';
import { getServerUrl } from './serverConfig';
import { CompactEncrypt, importJWK } from 'jose';

async function encryptAsJWE(payload: Record<string, unknown>, publicKeyJWK: Record<string, string>): Promise<string> {
    const publicKey = await importJWK(publicKeyJWK, 'ECDH-ES');
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));

    return new CompactEncrypt(plaintext)
        .setProtectedHeader({ alg: 'ECDH-ES', enc: 'A256GCM', kid: 'hotel-key' })
        .encrypt(publicKey);
}

export async function submitHotelCheckin(
    qrPayload: QRPayload,
    fullSdJwt: string,
    selectedClaimKeys: string[]
): Promise<CheckinResult> {
    const serverUrl = await getServerUrl();
    const checkinUrl = `${serverUrl}${qrPayload.checkinPath}`;
    const nonce = qrPayload.request.body.nonce;

    const sdJwt = buildSelectivePresentation(fullSdJwt, selectedClaimKeys);
    const jwe = await encryptAsJWE({ sdJwt }, qrPayload.hotelPublicKey);

    const res = await fetch(checkinUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwe, nonce }),
    });

    const data = (await res.json()) as CheckinResult;
    if (!res.ok) {
        throw new Error(data.error || data.message || `Error ${res.status}`);
    }
    return data;
}
