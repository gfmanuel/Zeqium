import * as SecureStore from 'expo-secure-store';
import { DEFAULT_SERVER_URL, STORE_KEYS } from '../config';

export async function getServerUrl(): Promise<string> {
    const stored = await SecureStore.getItemAsync(STORE_KEYS.SERVER_URL);
    return (stored || DEFAULT_SERVER_URL).replace(/\/$/, '');
}
