# Amcolink mobile app (Android first, iPhone later)

Official Amcolink app built with Expo SDK 55 + React Native + TypeScript (native screens, not a web wrapper).
It uses the existing Amcolink Supabase backend. The website (repo `african-market`) is the source of truth for
structure, wording, permissions and rules; files copied from it live in `src/core/` with the source commit noted.

Read `PROJECT_RULES.md` first. Progress: `docs/PROGRESS.md`. Decisions: `docs/DECISIONS.md`.

## Environments
| Build | Name / Android ID | Data |
|---|---|---|
| development, preview (test) | Amcolink (staging) / `com.amcolink.app.dev` | **staging** Supabase `ckhoycpsjftavuqxxnss` |
| production (store) | Amcolink / `com.amcolink.app` | production Supabase (only when `EXPO_PUBLIC_APP_ENV=production`) |

The app refuses to start if a test build points at production, or if a secret key is put in it.

Settings (public values only — never a secret or service_role key):
- `EXPO_PUBLIC_APP_ENV` — development / preview / production
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` (publishable key `sb_publishable_…`)
- `EXPO_PUBLIC_TURNSTILE_SITE_KEY`, `EXPO_PUBLIC_CAPTCHA_PAGE` — security check for sign-in/sign-up
- `EXPO_PUBLIC_SITE_URL` (default https://amcolink.com), `EXPO_PUBLIC_IMAGE_CDN` (optional)
- `ANDROID_VERSION_CODE` — set by the build

## Run on a computer (developer)
1. Node 22, Java 17, Android Studio with an emulator.
2. `npm ci`
3. Copy `.env.example` to `.env` and fill in the staging values (public values only).
4. `npx expo run:android` (builds and opens on the emulator or a phone with USB debugging).

## Checks
- `npm run check` — TypeScript + design rule (no colours outside `src/theme/tokens.ts`) + unit tests
- `npm run test:integration` — read-only checks against the real staging database (needs the staging key)
- Emulator flows: `.maestro/flows/*.yaml` (run on GitHub, Android 14)

## Android test builds (GitHub)
Every change to `main` runs the checks, the staging tests, builds the APK and runs the emulator flows.
- APK: **Releases** → "Test build N (staging)". Signed with Android's test key: for testing only, not for Google Play.
- Results and screenshots: branch `ci-results` (`latest.md`, `emulator-latest/shots/`).
- Needed GitHub secrets: `STAGING_SUPABASE_KEY`, `STAGING_TURNSTILE_SITE_KEY`.

## Staging test data
`docs/staging-seed.sql` adds 3 "[TEST]" profiles and 12 listings to **staging only**; `docs/staging-seed-remove.sql` removes them.

## Design
All colours, sizes, spacing, corners and fonts live in `src/theme/tokens.ts`.
Screens use the shared components in `src/components/ui` (AppText, Button, Chip, Icon, TextField) and `src/components`.
