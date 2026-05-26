/**
 * API Service Layer — Hotel Dashboard
 * Centraliza todas las llamadas HTTP al backend del Hotel.
 */

const API_BASE = '/api'

// ─── Token Management ───────────────────────────────────
export function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('zeqium_hotel_token')
}

export function setToken(token: string) {
    localStorage.setItem('zeqium_hotel_token', token)
}

export function clearToken() {
    localStorage.removeItem('zeqium_hotel_token')
}

// ─── HTTP Helpers ────────────────────────────────────────
async function authJson(): Promise<Record<string, string>> {
    const token = getToken()
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
}

async function post<T = unknown>(path: string, body: unknown, auth = false): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth) Object.assign(headers, await authJson())
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
    if (auth) Object.assign(headers, await authJson())
    const res = await fetch(`${API_BASE}${path}`, { headers })

    const ct = res.headers.get('content-type') || ''
    if (ct.includes('text/csv')) {
        const text = await res.text()
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return { csv: text } as T
    }

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`)
    return data as T
}

// ─── Auth ────────────────────────────────────────────────
export async function login(user: string, pass: string) {
    const data = await post<{ token: string }>('/auth/login', { user, pass })
    setToken(data.token)
    return data
}

export function logout() {
    clearToken()
}

// ─── Check-in flow ──────────────────────────────────────
export interface RequestedClaim {
    key: string
    label: string
    required: boolean
}

export interface AuthRequest {
    success?: boolean
    request: {
        type: string
        id?: string
        from?: string
        body: {
            nonce: string
            goal_code: string
            requirements: { schema: string; constraints?: unknown }[]
        }
    }
    requestedClaims?: RequestedClaim[]
    hotelPublicKey?: Record<string, string>
    qrPayload?: QRPayload
}

export interface QRPayload {
    type: 'zeqium:presentation-request'
    v: number
    checkinPath: string
    request: AuthRequest['request']
    requestedClaims: RequestedClaim[]
    hotelPublicKey: Record<string, string>
    hotelDid: string
}

export async function getAuthRequest(): Promise<AuthRequest> {
    return get<AuthRequest>('/auth-request')
}

export interface CheckinResult {
    message: string
    auditId: string
    user_checked_in: {
        nombre: string
        habitacion: string
        did: string
    }
}

export async function checkin(jwe: string, nonce: string): Promise<CheckinResult> {
    return post<CheckinResult>('/checkin', { jwe, nonce })
}

// ─── Guests ─────────────────────────────────────────────
export interface Guest {
    id: number
    did_huesped: string
    nombre: string
    apellidos: string
    habitacion: string
    fecha_entrada: string
    estado: string
    credential_hash: string
}

export async function getActiveGuests() {
    return get<{ guests: Guest[] }>('/guests/active', true)
}

// ─── Auditoría ──────────────────────────────────────────
export interface StayLog {
    id: number
    did_huesped: string
    nombre: string
    apellidos: string
    habitacion: string
    fecha_entrada: string
    estado: string
    credential_hash: string
}

export async function getAuditLogs() {
    return get<{ logs: StayLog[] }>('/audit/logs', true)
}

export async function getAuditLedger() {
    return get<{ ledger: unknown[] }>('/audit/ledger', true)
}

export async function exportStaysCSV() {
    return get<{ csv: string }>('/audit/export', true)
}
