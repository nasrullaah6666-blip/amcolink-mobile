/** The website address used in shared links (shared links always open the website, which works for everyone). */
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? 'https://amcolink.com').replace(/\/+$/, '');
export const BRAND = 'Amcolink';
export const adUrl = (id: string) => `${SITE_URL}/ads/${id}`;
export const shopUrl = (slug: string) => `${SITE_URL}/shops/${slug}`;
