/**
 * App settings come from build-time environment values (EXPO_PUBLIC_*). Nothing secret belongs here:
 * the Supabase "publishable" key is public by design and protected by the database's row-level security.
 * NEVER put a secret or service_role key in this app.
 */
const PRODUCTION_PROJECT_REF = 'mjqhfqylarqgtqdfjsen';

export type AppEnv = 'development' | 'preview' | 'production';

const appEnv = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as AppEnv;
const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseKey = (process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '').trim();
// Security check (Cloudflare Turnstile). The site key is public. The page shows the check and hands the token back.
const turnstileSiteKey = (process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY ?? '').trim();
const captchaPage = (process.env.EXPO_PUBLIC_CAPTCHA_PAGE ?? '').trim();

function problem(): string | null {
  if (!supabaseUrl || !supabaseKey) return 'The app is not set up yet: the Supabase address or public key is missing.';
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(supabaseUrl)) return 'The Supabase address looks wrong.';
  if (/^sb_secret_/.test(supabaseKey) || /service_role/.test(supabaseKey)) return 'A secret key was put in the app. Remove it now.';
  // Until the store release, only the staging project is allowed. Production needs a production build on purpose.
  if (supabaseUrl.includes(PRODUCTION_PROJECT_REF) && appEnv !== 'production') return 'This test build points at PRODUCTION. Only staging is allowed.';
  return null;
}

export const config = {
  appEnv,
  supabaseUrl,
  supabaseKey,
  configProblem: problem(),
  isStaging: !supabaseUrl.includes(PRODUCTION_PROJECT_REF),
  turnstileSiteKey,
  captchaPage,
  /** Sign-in needs both. Without them the app says so instead of trying (the server would refuse anyway). */
  captchaReady: /^[0-9A-Za-z_-]{10,100}$/.test(turnstileSiteKey) && /^https:\/\/[^\s?#]+$/.test(captchaPage),
} as const;
