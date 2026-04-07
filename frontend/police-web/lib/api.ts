/**
 * API Service Layer — Police Dashboard
 * Centraliza todas las llamadas HTTP al backend de la Policía.
 * El token JWT se gestiona con localStorage.
 */

const API_BASE = '/api/police'

// ─── Token Management ───────────────────────────────────
export function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('zeqium_police_token')
}

export function setToken(token: string) {
    localStorage.setItem('zeqium_police_token', token)
}

export function clearToken() {
    localStorage.removeItem('zeqium_police_token')
}

// ─── HTTP Helpers ────────────────────────────────────────
async function authHeaders(): Promise<Record<string, string>> {
    const token = getToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
}

async function post<T = unknown>(path: string, body: unknown, auth = false): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth) Object.assign(headers, await authHeaders())

    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`)
    return data as T
}

async function get<T = unknown>(path: string, auth = false): Promise<T> {
    const headers: Record<string, string> = {}
    if (auth) Object.assign(headers, await authHeaders())

    const res = await fetch(`${API_BASE}${path}`, { headers })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/csv')) {
        const text = await res.text()
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return { csv: text } as T
    }

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`)
    return data as T
}

// ─── 1. Autenticación ────────────────────────────────────
export async function login(user: string, pass: string) {
    const data = await post<{ success: boolean; token: string }>('/auth/login', { user, pass })
    setToken(data.token)
    return data
}

export function logout() {
    clearToken()
}

// ─── 2. DID Management ──────────────────────────────────
export async function registerDID(id: string, pubKey: string, controller: string) {
    return post('/did', { id, pubKey, controller })
}

export async function resolveDID(id: string) {
    return get(`/did/${encodeURIComponent(id)}`)
}

// ─── 3. Schemas ─────────────────────────────────────────
export async function registerSchema(schemaID: string, name: string, version: string, attributes: string[]) {
    return post('/issuer/schemas', { schemaID, name, version, attributes }, true)
}

export async function getSchema(id: string) {
    return get(`/schema/${encodeURIComponent(id)}`)
}

// ─── 4. Credential Definitions ──────────────────────────
export async function createCredentialDefinition(credDefID: string, schemaID: string, publicKeys: Record<string, string>) {
    return post('/issuer/credential-definitions', { credDefID, schemaID, publicKeys }, true)
}

export async function getCredentialDefinition(id: string) {
    return get(`/ledger/cred-def/${encodeURIComponent(id)}`)
}

// ─── 5. Emisión de Credenciales ─────────────────────────
export async function getAuthRequest() {
    return get<{ success: boolean; nonce: string }>('/issuer/auth-request', true)
}

export interface IssueCredentialParams {
    schemaID: string
    holderDID: string
    nonce: string
    userData: {
        given_name: string
        family_name: string
        birth_date: string
        national_id: string
        nacionalidad: string
    }
}

export async function issueCredential(params: IssueCredentialParams) {
    return post<{
        success: boolean
        credential: string
        statusHash: string
        message: string
    }>('/issuer/credential', params, true)
}

// ─── 6. Estado de Credencial (público) ──────────────────
export async function getCredentialStatus(hash: string) {
    return get<{ success: boolean; hash: string; status: string }>(`/status/${hash}`)
}

// ─── 7. Revocación ──────────────────────────────────────
export async function revokeCredential(credentialHash: string, reason: string = 'ADMIN_REQUEST') {
    return post<{
        success: boolean
        message: string
        status: string
        credentialHash: string
    }>('/issuer/revoke', { credentialHash, reason }, true)
}

// ─── 8. Historial y Auditoría ───────────────────────────
export interface CredentialHistoryItem {
    did_holder: string
    credential_hash: string
    estado: string
    fecha_emision: string
    fecha_revocacion: string | null
}

export async function getHistory() {
    return get<{ success: boolean; history: CredentialHistoryItem[] }>('/issuer/history', true)
}

export async function getAuditLog() {
    return get<{ success: boolean; audit: unknown[] }>('/issuer/audit/log', true)
}

export async function exportAuditCSV() {
    return get<{ csv: string }>('/issuer/audit/export', true)
}
