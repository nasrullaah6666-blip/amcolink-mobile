import { db } from '@/api/db';
import { config } from '@/lib/config';
import { SITE_URL } from '@/lib/site';

/**
 * "Fill in the ad from my photo" — uses the website's AI helper (app/api/ai/suggest/route.ts, Claude Haiku).
 * The website keeps the AI key and the rules (own photo only, own shop, 20 uses a day); the app only sends its sign-in.
 */
export type Suggestion = {
  title: string;
  category: string;
  subcategory: string;
  condition: string;
  description: string;
  price: { low: number; high: number; currency: string; confident: boolean } | null;
};

/** The helper checks sign-ins against the production database, so only the store app can use it (test builds use staging). */
export const aiHelperAvailable = () => config.appEnv === 'production' && !config.isStaging;

export async function suggestFromPhoto(imageUrl: string, shopId: string): Promise<Suggestion> {
  const { data } = await db().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in first.');
  let res: Response;
  try {
    res = await fetch(`${SITE_URL}/api/ai/suggest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ imageUrl, shopId }),
      signal: AbortSignal.timeout(40000),
    });
  } catch {
    throw new Error('No connection, or the helper took too long. Please try again.');
  }
  let body: Record<string, unknown> = {};
  try { body = await res.json(); } catch { /* not JSON */ }
  if (!res.ok) throw new Error(typeof body.error === 'string' && body.error ? body.error : 'The AI helper is unavailable right now. Please fill in the details yourself.');
  return body as unknown as Suggestion;
}

/** Middle of the estimated price range, rounded (the website's "Use …" button). */
export const middlePrice = (p: { low: number; high: number }) => Math.round((p.low + p.high) / 2);
