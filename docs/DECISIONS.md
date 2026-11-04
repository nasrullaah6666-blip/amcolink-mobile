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
- **Chosen:** features not built yet are hidden (Home country pill, Filters, Explore Trending/Gifts/Wanted) instead of shown disabled.
- **Why:** the directive forbids unfinished workflows reaching users; dead buttons look broken.
