# Amcolink Android — development progress log

One task at a time: start → finish → test → verify → document → next.
Status values: NOT STARTED / IN PROGRESS / BLOCKED / COMPLETED.

| # | Task | Status |
|---|---|---|
| 1 | Foundation: Expo SDK 55 project, design rules, shared components, navigation shell, staging client | COMPLETED |
| 2 | Test setup: unit tests (Jest) for guard, session storage, copied website rules | COMPLETED |
| 3 | GitHub build: APK on every change + read-only staging integration tests + results written back to the repo | IN PROGRESS |

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
- **Tests:** integration test file loads and refuses to run without staging settings (checked locally). Real run: pending on GitHub.
