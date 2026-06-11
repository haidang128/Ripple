import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// ─── Native storage (SecureStore, chunked for large JWTs) ──────

const CHUNK = 2000;

const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    const n = await SecureStore.getItemAsync(`${key}__n`);
    if (n) {
      const parts: string[] = [];
      for (let i = 0; i < parseInt(n, 10); i++) {
        parts.push((await SecureStore.getItemAsync(`${key}__${i}`)) ?? '');
      }
      return parts.join('');
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks = Math.ceil(value.length / CHUNK);
    await SecureStore.setItemAsync(`${key}__n`, String(chunks));
    await Promise.all(
      Array.from({ length: chunks }, (_, i) =>
        SecureStore.setItemAsync(`${key}__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK)),
      ),
    );
  },
  async removeItem(key: string): Promise<void> {
    const n = await SecureStore.getItemAsync(`${key}__n`);
    if (n) {
      await SecureStore.deleteItemAsync(`${key}__n`);
      await Promise.all(
        Array.from({ length: parseInt(n, 10) }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}__${i}`),
        ),
      );
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// ─── Web storage (localStorage, SSR-safe) ─────────────────────

const webStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
