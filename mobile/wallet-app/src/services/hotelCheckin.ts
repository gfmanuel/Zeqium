import type { CheckinResult, QRPayload } from '../types/presentation';
import { buildSelectivePresentation } from './sdjwtPresentation';
import { getServerUrl } from './serverConfig';

export async function submitHotelCheckin(
    qrPayload: QRPayload,
    fullSdJwt: string,
    selectedClaimKeys: string[]
): Promise<CheckinResult> {
    const serverUrl = await getServerUrl();
    const checkinUrl = `${serverUrl}${qrPayload.checkinPath}`;
    const nonce = qrPayload.request.body.nonce;

    const sdJwt = buildSelectivePresentation(fullSdJwt, selectedClaimKeys);

    const res = await fetch(checkinUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentation: sdJwt, nonce }),
    });

    const data = (await res.json()) as CheckinResult;
    if (!res.ok) {
        throw new Error(data.error || data.message || `Error ${res.status}`);
    }
    return data;
}
