import type { SupabaseClient } from '@supabase/supabase-js';

/** The app's Supabase client (loaded on first use, so query code can also run in tests with another client). */
export function db(): SupabaseClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabase } = require('@/lib/supabase') as { supabase: SupabaseClient | null };
  if (!supabase) throw new Error('The app is not connected to Amcolink yet.');
  return supabase;
}

/** For one-row lookups: the row, or null when there is none (never an empty list). */
export function mustOne<T>(res: { data: T | null; error: { message: string } | null }): T | null {
  if (res.error) throw new Error(friendlyError(res.error.message));
  return res.data ?? null;
}

/** Turns a Supabase reply into data, or throws a friendly error. */
export function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(friendlyError(res.error.message));
  return (res.data ?? ([] as unknown as T)) as T;
}

export function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('network') || m.includes('failed to fetch') || m.includes('timeout')) return 'No connection. Check your internet and try again.';
  if (m.includes('jwt expired') || m.includes('invalid jwt')) return 'Please sign in again.';
  return message;
}
