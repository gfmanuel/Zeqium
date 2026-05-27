/**
 * Zeqium Wallet — Config
 */

// URL base del servidor (configurable desde Settings)
export const DEFAULT_SERVER_URL = 'http://192.168.0.23:4001';

// Clave pública X25519 del Hotel (para JWE en Fase 2)
export const HOTEL_PUBLIC_KEY_JWK = {
    crv: 'X25519',
    x: '8PoTpF9Cw0hdn4FNsnDXv_i8wUQGif50NClQf7QFhn8',
    kty: 'OKP',
};

// Claves de SecureStore
export const STORE_KEYS = {
    SERVER_URL: 'zeqium_server_url',
    ONBOARDED: 'zeqium_onboarded',
};
