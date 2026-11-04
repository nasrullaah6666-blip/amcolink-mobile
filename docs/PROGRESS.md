# Amcolink Android — development progress log

One task at a time: start → finish → test → verify → document → next.
Status values: NOT STARTED / IN PROGRESS / BLOCKED / COMPLETED.

| # | Task | Status |
|---|---|---|
| 1 | Foundation: Expo SDK 55 project, design rules, shared components, navigation shell, staging client | COMPLETED |
| 2 | Test setup: unit tests (Jest) for guard, session storage, copied website rules | COMPLETED |
| 3 | GitHub build: APK on every change + read-only staging integration tests + results written back to the repo | COMPLETED |
| 4 | Android emulator test on GitHub (Maestro): open the app, visit every tab, screenshots back to the repo | IN PROGRESS |

---

## Task 1 — Foundation
- **Objective:** a runnable Android app shell that follows the website and the approved architecture.
- **Files:** `src/theme/tokens.ts`, `src/components/ui/*`, `src/app/_layout.tsx`, `src/app/(tabs)/*`, `src/lib/config.ts`, `src/lib/secureStorage.ts`, `src/lib/supabase.ts`, `src/core/categories.ts`, `scripts/check-design.js`, `app.json`, `.env.example`, `PROJECT_RULES.md`, `README.md`.
- **Tests:** TypeScript check passed; design check passed; Android JavaScript bundle built (`expo export --platform android`); Android project generated (`expo prebuild`) with ID `com.amcolink.app.dev` and test signing.
- **Not tested here:** running on an emulator or phone (no Android emulator in this workspace). First GitHub build started 4 Nov 22:19; result not yet seen by me.
- **Remaining issues:** `expo lint` could not run in this workspace (its setup download was blocked).

## Task 2 — Test setup
- **Objective:** automated tests that run locally and on GitHub.
- **Files:** `package.json` (jest, jest-expo, @testing-library/react-native), `src/lib/__tests__/config.test.ts`, `src/lib/__tests__/secureStorage.test.ts`, `src/core/__tests__/core.test.ts`, `src/core/*` (website logic copied unchanged, import paths adapted).
- **Tests:** 13 of 13 passed locally (staging accepted, production refused in test builds, secret keys refused, wrong address refused, large sessions split and rejoined, categories match the website).
- **Remaining issues:** none.

## Task 3 — GitHub build with results
- **Objective:** every change to `main` runs checks + read-only staging tests and builds an installable test APK; results are written to the `ci-results` branch so they can be read without the Actions page.
- **Files:** `.github/workflows/android-test-build.yml`, `integration/staging.test.ts`, `jest.integration.config.js`.
- **Tests:** GitHub build 2 (commit 7df5cc9): install, checks (types, design, 13 unit tests), **10/10 staging integration tests**, Android project, Gradle build and release `test-build-2` all succeeded. Build took about 33 minutes (no cache yet).
- **Integration tests passed on real staging:** signed-out can read approved shops and published ads; 243 countries; Wanted WhatsApp hidden from signed-out; public Wanted columns readable; signed-out cannot create shops or reports; admin functions refused; trending readable; sign-up without CAPTCHA refused; notifications private.
- **Remaining issues:** build 1 (first workflow) result not seen; superseded by build 2.

## Task 4 — Emulator test
- **Objective:** real Android checks without a phone: install the APK on an emulator (Android 14, Pixel 6 size), run Maestro flows, return screenshots and app error logs.
- **Files:** `.maestro/flows/01-smoke.yaml`, `.maestro/run.sh`, workflow job `emulator`; Gradle cache added to speed builds.
