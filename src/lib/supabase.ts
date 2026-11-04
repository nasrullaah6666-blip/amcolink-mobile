import { setupURLPolyfill } from 'react-native-url-polyfill';
import { AppState } from 'react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import { secureStorage } from './secureStorage';

setupURLPolyfill();

/** One Supabase client for the whole app. Null when the app is not set up (see config.configProblem). */
export const supabase: SupabaseClient | null = config.configProblem
  ? null
  : createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { storage: secureStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    });

// Refresh the login only while the app is on screen (Supabase's recommended pattern for phones).
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
