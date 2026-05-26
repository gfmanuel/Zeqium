/**
 * Zeqium Wallet — SQLite Database
 *
 * Almacena credenciales SD-JWT recibidas por QR.
 * Usa expo-sqlite (async API).
 */

import * as SQLite from 'expo-sqlite';

export interface Credential {
    id: string;
    raw_jwt: string;
    given_name: string;
    family_name: string;
    birth_date: string;
    national_id: string;
    nationality: string;
    issuer_did: string;
    status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
    received_at: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
    db = await SQLite.openDatabaseAsync('zeqium_wallet.db');
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS credentials (
            id TEXT PRIMARY KEY,
            raw_jwt TEXT NOT NULL,
            given_name TEXT NOT NULL DEFAULT '',
            family_name TEXT NOT NULL DEFAULT '',
            birth_date TEXT NOT NULL DEFAULT '',
            national_id TEXT NOT NULL DEFAULT '',
            nationality TEXT NOT NULL DEFAULT '',
            issuer_did TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            received_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);
}

export async function saveCredential(cred: Credential): Promise<void> {
    if (!db) throw new Error('DB not initialized');
    await db.runAsync(
        `INSERT OR REPLACE INTO credentials
         (id, raw_jwt, given_name, family_name, birth_date, national_id, nationality, issuer_did, status, received_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cred.id, cred.raw_jwt, cred.given_name, cred.family_name, cred.birth_date,
        cred.national_id, cred.nationality, cred.issuer_did, cred.status, cred.received_at]
    );
}

export async function getAllCredentials(): Promise<Credential[]> {
    if (!db) throw new Error('DB not initialized');
    return await db.getAllAsync<Credential>('SELECT * FROM credentials ORDER BY received_at DESC');
}

export async function getCredentialById(id: string): Promise<Credential | null> {
    if (!db) throw new Error('DB not initialized');
    const row = await db.getFirstAsync<Credential>('SELECT * FROM credentials WHERE id = ?', [id]);
    return row || null;
}

export async function deleteCredential(id: string): Promise<void> {
    if (!db) throw new Error('DB not initialized');
    await db.runAsync('DELETE FROM credentials WHERE id = ?', [id]);
}

export async function deleteAllCredentials(): Promise<void> {
    if (!db) throw new Error('DB not initialized');
    await db.runAsync('DELETE FROM credentials');
}

function decodeBase64Url(b64: string): string {
    const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    // atob() returns Latin-1; re-decode as UTF-8 to support ñ, tildes, etc.
    return decodeURIComponent(
        binary.split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
}

/** Convierte un claim a string legible (evita mostrar {0:M, 1:a...} de strings mal empaquetados). */
export function claimToString(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(claimToString).join('');
    if (typeof value === 'object') {
        const o = value as Record<string, unknown>;
        const keys = Object.keys(o).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
        if (keys.length > 0 && keys.length === Object.keys(o).length) {
            return keys.map((k) => claimToString(o[k])).join('');
        }
    }
    return String(value);
}

/**
 * Parsea un SD-JWT y extrae los claims del payload y las disclosures.
 * Format: header.payload.signature~disclosure1~disclosure2~...
 */
export function parseSDJWT(sdJwt: string): Record<string, unknown> {
    try {
        const parts = sdJwt.split('~').filter((p) => p.length > 0);
        const jwtPart = parts[0];

        const payloadB64 = jwtPart.split('.')[1];
        if (!payloadB64) return {};

        const payload = JSON.parse(decodeBase64Url(payloadB64)) as Record<string, unknown>;
        const claims: Record<string, unknown> = {
            iss: payload.iss,
            sub: payload.sub,
            iat: payload.iat,
            exp: payload.exp,
        };

        const reserved = new Set(['_sd', '_sd_alg', 'iss', 'sub', 'iat', 'exp', 'nbf', 'aud', 'jti', 'vct']);
        for (const [key, value] of Object.entries(payload)) {
            if (!reserved.has(key)) {
                claims[key] = value;
            }
        }

        for (let i = 1; i < parts.length; i++) {
            const segment = parts[i];
            if (segment.includes('.')) continue;

            try {
                const discArr = JSON.parse(decodeBase64Url(segment)) as unknown[];
                if (!Array.isArray(discArr)) continue;

                if (discArr.length >= 3 && typeof discArr[1] === 'string') {
                    claims[discArr[1]] = discArr[2];
                }
            } catch {
                // disclosure inválida
            }
        }

        for (const key of Object.keys(claims)) {
            const v = claims[key];
            if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
                const o = v as Record<string, unknown>;
                const numericKeys = Object.keys(o).filter((k) => /^\d+$/.test(k));
                if (numericKeys.length > 0 && numericKeys.length === Object.keys(o).length) {
                    claims[key] = numericKeys.sort((a, b) => Number(a) - Number(b)).map((k) => claimToString(o[k])).join('');
                }
            }
        }

        return claims;
    } catch {
        return {};
    }
}
