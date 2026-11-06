# Amcolink Android — technical decisions

Each entry: what was chosen, why, and what else was considered.

## D1. Expo SDK 55 (not the newest 58)
- **Chosen:** SDK 55.
- **Why:** the owner's Android phone now runs Expo Go for SDK 55 (installed for the CAPTCHA test). Expo Snack also stops at 55.
- **Alternatives:** SDK 58 (newest). Upgrade later when the app is built as its own installable app only; tracked as a later task.

## D2. Test builds on GitHub with Gradle (not Expo's cloud build)
- **Chosen:** `expo prebuild` + Gradle on GitHub Actions; APK published as a GitHub pre-release.
- **Why:** Expo's cloud build cannot create the Android signing key in automatic (non-interactive) mode. GitHub building needs no Expo login, and Claude can trigger it by pushing code.
- **Alternatives:** EAS Build (needs one interactive login on the owner's laptop to create the key); laptop builds (owner's machine every time).
- **Limit:** test APKs use Android's standard test key: fine for testing, NOT for Google Play. The store build gets its own key (owner action).

## D3. One design-rules file + enforced check
- **Chosen:** `src/theme/tokens.ts` holds every colour, size, spacing step, corner and font; `npm run check:design` fails on any colour written elsewhere.
- **Why:** the owner asked for buttons, pills and colours to be constant everywhere.
- **Alternatives:** a UI library (adds weight and its own look); NativeWind (Tailwind classes; extra setup and still allows stray colours).

## D4. Session storage: phone secure storage split into parts
- **Chosen:** `expo-secure-store` with the session split into parts of 1,800 characters.
- **Why:** secure storage is protected by the phone's Keystore; one slot is about 2 KB and a Supabase session can be larger.
- **Alternatives:** AsyncStorage (not encrypted); encrypted AsyncStorage with a key in secure storage (more code, same protection).

## D5. Website logic copied, not shared
- **Chosen:** pure files from the website's `lib/` copied into `src/core/` with the source commit noted; website repo untouched.
- **Why:** the owner forbade changes to the website repo; sharing a package would change its build.
- **Correction to the audit:** `lib/blocks.ts` and `lib/favorites.ts` are NOT pure (they use the website's server login); they are rewritten for the app instead of copied.

## D6. Integration tests: read-only, staging, on GitHub
- **Chosen:** tests that act as a signed-out visitor and expect every write to be refused.
- **Why:** this workspace cannot reach Supabase; GitHub can, using the staging key stored as a secret. Nothing is written to staging.

## D7. Data loading with TanStack Query
- **Chosen:** TanStack Query for every read (cache 60 s, 2 retries, infinite scroll pages).
- **Why:** gives loading, error, retry and pull-to-refresh the same way on every screen without custom code.
- **Alternatives:** plain `useEffect` fetching (repeated code, no cache); Redux Toolkit Query (heavier).

## D8. Visitor key for view counts
- **Chosen:** a random 40-character key kept on the phone, sent with `track_event` like the website's visitor cookie, so each person counts once.
- **Why:** the website's trending rules count people, not taps. The key holds no personal data.
- **Alternatives:** none needed: the database function already expects this key.

## D9. No buttons that do nothing
- **Chosen:** features not built yet are hidden (Home Filters, Explore Trending/Gifts) instead of shown disabled. The country pill and Wanted are now built.
- **Why:** the directive forbids unfinished workflows reaching users; dead buttons look broken.

## D10. Security check page for the app
- **Chosen:** the app shows Cloudflare Turnstile inside a small web box that loads one page (`EXPO_PUBLIC_CAPTCHA_PAGE`) and only lets that page and Cloudflare load. Test builds use the Worker page that passed the CAPTCHA test.
- **Why:** Supabase requires a Turnstile token for sign-in/sign-up (CAPTCHA stays on). Turnstile only runs in a web page on an approved address.
- **Alternatives:** loading the check with a fake website address (works on some phones, but pretends to be amcolink.com — not used); a page on amcolink.com (needs a website change — not allowed).
- **Production:** needs a permanent check page on the owner's Cloudflare and that address added to the production Turnstile widget (owner action, listed in the report).

## D11. Test app and store app side by side
- **Chosen:** `app.config.ts` gives test builds the name "Amcolink (staging)" and Android ID `com.amcolink.app.dev`; the store build (`EXPO_PUBLIC_APP_ENV=production`) is "Amcolink", `com.amcolink.app`. Version code = build number.
- **Why:** testers can keep both on one phone, and a test build can never be mistaken for the real app. The data guard still refuses production data in test builds.
- **Note:** `com.amcolink.app` becomes permanent once uploaded to Google Play — owner to confirm it before the first upload.

## D12. App icon from the website logo
- **Chosen:** icons drawn from the website's own logo (components/Logo.tsx: green tile, white bag, "A" with linked rings), rendered at 1024 px; Android adaptive icon with the bag inside the safe zone and a white one-colour version for themed icons.
- **Alternatives:** the Expo default icon (not Amcolink); the website's 512 px PNG (too small for the store).

## D13. WhatsApp Status sharing goes through the phone's share screen
- **Chosen:** the app makes the picture and opens Android's share screen; the person taps WhatsApp, then "My status".
- **Why:** WhatsApp has no public way for another app to post straight to Status. Opening the share screen works on every phone, also without WhatsApp (Facebook, Instagram, Telegram), and needs no extra permission.
- **Note:** a link inside a picture cannot be tapped, so the picture shows "amcolink.com" in large text; the regular Share button still sends a tappable link.

## D14. Photo helper uses the website's AI route, store build only
- **Chosen:** the app calls the website's existing `/api/ai/suggest` with its sign-in token; the website adds only the token check.
- **Why:** the AI key must stay on the server (never in the app), and the website already has the prompt, limits and checks — no duplicated logic.
- **Limit:** test builds sign in to staging, which the website does not know, so the button is shown only in the production build.
- **Colour:** the website's button is violet; the app's is Amcolink green (owner's green-only rule). The website button is unchanged unless the owner asks.

## D15. Package warnings from npm audit (6 Nov 2026)
- `npm audit` lists 25 warnings (5 "high": decode-uri-component, zod and others). All are inside build tools and helper
  libraries used while building or testing (Metro, Jest, Expo's command-line tools), not code that runs on the phone.
- **Chosen:** do NOT run `npm audit fix --force`: it would jump Expo/React Native versions and break the build.
  They go away with the planned Expo upgrade (D1). Re-check after that upgrade.

## D16. Branches and builds (6 Nov 2026)
- GitHub's 2,000 free Actions minutes ran out on 6 Nov (about 34 builds in one day, every commit went straight to main).
- **Chosen:** work only on branches (PROJECT_RULES rule 10); main changes only with the owner's approval.
  Pushing a branch never builds. Notes-only changes (docs, *.md) never build.
  Owner chose (6 Nov): builds stay AUTOMATIC — every approved change that goes to main builds by itself.
