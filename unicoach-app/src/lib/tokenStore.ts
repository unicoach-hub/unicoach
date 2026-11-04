import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'unicoach_token';

// Keychain / Keystore on phones. SecureStore has no web build, so the web preview uses localStorage.
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (token) globalThis.localStorage?.setItem(KEY, token);
      else globalThis.localStorage?.removeItem(KEY);
    } catch {
      // private mode: the session just won't survive a reload
    }
    return;
  }
  if (token) await SecureStore.setItemAsync(KEY, token);
  else await SecureStore.deleteItemAsync(KEY);
}
