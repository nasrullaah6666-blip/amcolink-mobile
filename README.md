# Amcolink mobile app (Android first, iPhone later)

Official Amcolink app built with Expo + React Native + TypeScript. Uses the existing Amcolink Supabase backend.
The website (repo `african-market`) is the source of truth for structure, wording, permissions and rules.

## Rules
Read `PROJECT_RULES.md` first.

## Environments
- Development / test builds: **staging** Supabase only (`ckhoycpsjftavuqxxnss`). The app refuses to start if pointed at production.
- Settings come from `EXPO_PUBLIC_*` values (see `.env.example`). Public values only. Never put a secret or service_role key here.

## Checks
- `npm run typecheck` — TypeScript
- `npm run check:design` — fails if any colour is written outside `src/theme/tokens.ts`
- `npm run check` — both

## Design
All colours, sizes, spacing, corners and fonts live in `src/theme/tokens.ts`.
Screens use only the shared components in `src/components/ui` (AppText, Button, Chip, Icon).

## Android test builds
Every change to `main` builds an Android test app on GitHub (Actions -> "Android test build").
The APK appears under **Releases** as "Test build N (staging)". It is signed with the Android test key: testing only.
