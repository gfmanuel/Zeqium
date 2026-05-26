function decodeBase64Url(b64: string): string {
    const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    return atob(padded + pad);
}

export function listDisclosableClaims(sdJwt: string): string[] {
    const parts = sdJwt.split('~').filter((p) => p.length > 0);
    const keys: string[] = [];

    for (let i = 1; i < parts.length; i++) {
        const segment = parts[i];
        if (segment.includes('.')) continue;
        try {
            const arr = JSON.parse(decodeBase64Url(segment)) as unknown[];
            if (Array.isArray(arr) && arr.length >= 3 && typeof arr[1] === 'string') {
                keys.push(arr[1]);
            }
        } catch {
            // ignore
        }
    }

    return keys;
}

export function buildSelectivePresentation(sdJwt: string, claimKeys: string[]): string {
    const parts = sdJwt.split('~').filter((p) => p.length > 0);
    const jwtPart = parts[0];
    const selected = new Set(claimKeys);
    const disclosureSegments: string[] = [];

    for (let i = 1; i < parts.length; i++) {
        const segment = parts[i];
        if (segment.includes('.')) continue;
        try {
            const arr = JSON.parse(decodeBase64Url(segment)) as unknown[];
            if (Array.isArray(arr) && arr.length >= 3 && typeof arr[1] === 'string' && selected.has(arr[1])) {
                disclosureSegments.push(segment);
            }
        } catch {
            // ignore
        }
    }

    if (disclosureSegments.length === 0) {
        return jwtPart;
    }

    return `${jwtPart}~${disclosureSegments.join('~')}~`;
}

export function parsePresentationQR(raw: string): import('../types/presentation').QRPayload | null {
    try {
        const data = JSON.parse(raw.trim());
        if (data?.type === 'zeqium:presentation-request' && data.request?.body?.nonce) {
            return data;
        }
    } catch {
        // not JSON
    }
    return null;
}
