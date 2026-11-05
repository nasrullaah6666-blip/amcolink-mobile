# Amcolink Android — development progress log

One task at a time: start → finish → test → verify → document → next.
Status values: NOT STARTED / IN PROGRESS / BLOCKED / COMPLETED.

| # | Task | Status |
|---|---|---|
| 1 | Foundation: Expo SDK 55 project, design rules, shared components, navigation shell, staging client | COMPLETED |
| 2 | Test setup: unit tests (Jest) for guard, session storage, copied website rules | COMPLETED |
| 3 | GitHub build: APK on every change + read-only staging integration tests + results written back to the repo | COMPLETED |
| 4 | Android emulator test on GitHub (Maestro): open the app, visit every tab, screenshots back to the repo | COMPLETED |
| 5 | Data layer + Home feed (latest finds, search box, category tiles) | IN PROGRESS |
| 6 | Browse screens: listing detail, shop profile, category, search, property, Explore collections | IN PROGRESS |
| 7 | Accounts: sign in, create account, forgot password, sign out, Account tab | BLOCKED (owner: staging security-check site key) |
| 8 | Saved, Follow, Report, Block (signed-in buyer actions) | IN PROGRESS |
| 9 | Seller: create profile, My ads (stats, confirm, available/reserved/sold, hide, delete) | IN PROGRESS |
| 10 | Post Ad for Shopping and Services, with photo upload | IN PROGRESS |
| 11 | Notifications inbox and Delete account | IN PROGRESS |
| 12 | Wanted: browse, post, reply on WhatsApp, found/delete, report | IN PROGRESS |

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
- **Result (build 6, commit c740de1, Android 14 emulator):** the app installs and opens; flows 01-smoke and 02-browse PASSED; 03-account failed only because the test looked for the words "Create account" alone (they sit inside a longer line) — test fixed. 13 screenshots saved in `ci-results/emulator-6/`.
- **What the screenshots show:** Home, tabs, Property (rent and sale with the right safety notes), Fashion category with sub-category chips, Explore, Free stuff, Search, Sign in, Forgot password all render correctly in Amcolink green. Staging has **no listings yet**, so lists show their empty states — listing and shop pages could not be seen with real data (owner action: test data on staging).
- **Earlier problems fixed:** results upload to `ci-results` failed in builds 3–4 (fixed by pushing from a fresh copy, build 5 onwards).

## Task 5 — Data layer + Home feed
- **Objective:** the app reads the same listings the website shows, with the same rules.
- **Files:** `src/api/db.ts`, `src/api/listings.ts`, `src/api/track.ts`, `src/lib/visitor.ts`, `src/lib/site.ts`, `src/components/{Photo,ListingCard,ListingGrid,States}.tsx`, `src/app/(tabs)/index.tsx`, `src/app/_layout.tsx` (data cache).
- **Rules copied from the website:** published ads of approved shops, available or reserved, confirmed in the last 14 days, verified sellers first, then newest; 24 per page; search uses the website's word rules and closest-title ranking.
- **Tests:** unit tests on every query's filters (fake database client) — passed locally; new staging integration tests that run each app query against the real staging database — pending GitHub run.
- **Changed from the mockup:** the country pill and Filters button on Home are not shown yet (they would do nothing); they return with the country choice task.

## Task 6 — Browse screens
- **Objective:** a buyer can open any listing, see the seller, call or WhatsApp, and browse by category, property, search and Explore.
- **Files:** `src/app/ads/[id].tsx`, `src/app/shops/[slug].tsx`, `src/app/category/[slug].tsx`, `src/app/search.tsx`, `src/app/properties.tsx`, `src/app/explore.tsx`, `src/app/collection/[kind].tsx`, `src/components/{PhotoPager,ContactBar,ScreenHeader,SearchField,ChipRow}.tsx`.
- **Website behaviour kept:** WhatsApp message text, Call/WhatsApp/view/share counted with `track_event`, safety notes (general, rent, sale), shop rating and open/closed hours, map link, old category links.
- **Explore:** Deals, Free stuff, Brand new and Used are built. Trending, Gifts and Wanted are NOT shown yet (no dead buttons); they are later tasks.
- **Not yet:** saving (heart), report, block — these need sign-in (later tasks).

### Found by the staging tests (build 5)
- One-row lookups (a listing, a shop) returned an empty list instead of "nothing" when the row did not exist. Fixed (`mustOne`) and covered by a unit test.

## Task 7 — Accounts
- **Objective:** sign in, create account, resend confirmation, forgot password and sign out, exactly as on the website (same checks, messages, CAPTCHA on every attempt, one token per attempt).
- **Files:** `src/components/AuthForm.tsx`, `src/components/HumanCheck.tsx`, `src/components/ui/TextField.tsx`, `src/auth/session.tsx`, `src/app/sign-in.tsx`, `src/app/sign-up.tsx`, `src/app/forgot-password.tsx`, `src/app/(tabs)/account.tsx`, `src/lib/config.ts`.
- **Website behaviour kept:** password rules (`core/password`), friendly errors (`core/authErrors`), "may already have an account" rule, Check-your-email screen with 60-second resend wait, Terms/18+ tick box, email links open the website (`/auth/callback`), wrong password clears the field.
- **Tests:** 5 unit tests (token sent, wrong password, no token = nothing sent, sign-up rules, sign-up data) — passed locally.
- **BLOCKED:** the test build needs the staging Turnstile **site key** (public value) as GitHub secret `STAGING_TURNSTILE_SITE_KEY`. Without it the app shows "The security check is not set up in this build" and does not try to sign in.
- **Not yet verified:** a real sign-in on the emulator/phone (needs the key and a staging test account).

## Task 8 — Saved, Follow, Report, Block
- **Objective:** the signed-in buyer actions the website has on listings and shops.
- **Files:** `src/api/me.ts`, `src/auth/mine.ts`, `src/components/SaveButton.tsx`, `src/components/ReportAndBlock.tsx`, `src/core/reportReasons.ts`, `src/app/(tabs)/saved.tsx`, Account tab (blocked shops + Unblock), heart on every listing card and the listing page, Follow on the shop page.
- **Website rules kept:** favorites one row per listing/shop; report reasons and text rule; "already reported" answer; block confirmation text; blocked shops hidden from lists.
- **Difference:** the website hides blocked shops inside the database query; the app hides them after loading (a page may show fewer than 24 items). Same result for the buyer.
- **Not in this task:** saved searches and price-drop alerts (later task).
- **Tests:** 4 unit tests (report text, save, already reported, block); staging test that signed-out visitors cannot save or block.
- **Not yet verified on a device:** needs sign-in (Task 7 blocker).

## Task 9 — Seller profile and My ads
- **Objective:** a seller can create their profile and manage their ads like the website dashboard.
- **Files:** `src/api/seller.ts`, `src/app/shops/new.tsx`, `src/app/dashboard.tsx`, `src/components/PickerField.tsx`, `src/core/{shop,saveShop,places,deletePhotos}.ts` (copied from the website).
- **Website rules kept:** profile form fields and checks (`parseShopForm`), name-taken check, slug rule, region → town picker with "Other", one number for call and WhatsApp; dashboard filters, 30-day stats (`my_listing_stats`), "not confirmed for a week" nudge and Confirm all, Still available/Reserved/Sold, Hide, Delete with photo clean-up.
- **Not yet:** edit profile (logo, address, hours, links), edit ad, pin, away mode, reviews panel.
- **Staging note:** the repository's database rules (loaded on staging) may require an address when a profile is created; production does not (decision D-4). If staging refuses a new profile, that is this difference, not an app error. To be checked once sign-in works.

## Task 10 — Post Ad (Shopping and Services)
- **Objective:** post a listing with photos from the phone.
- **Files:** `src/app/(tabs)/post.tsx`, `src/api/postAd.ts`, `src/api/photos.ts`, `src/core/notAllowed.ts`, `app.json` (photo and camera permission text).
- **Website rules kept:** checks, messages and saved columns from `AdForm` (photos 1–6, description ≥ 20, sub-category, condition, expiry for food/cosmetics, services price modes, free items, rules tick). Photos: JPEG ≤ 2048 px and ≈1.5 MB at `{user}/{random}.jpg` plus a 480 px thumbnail, same as the website.
- **Not in the app yet:** Properties (houses, rooms, land — the form shows a link to the website); gift tags; AI "fill in details"; photo fingerprints (`photo_hashes`, optional on the website too).
- **Tests:** 5 unit tests on the listing rules; staging test that signed-out visitors cannot post or upload.

## Task 11 — Notifications and Delete account
- **Files:** `src/api/account.ts`, `src/app/notifications.tsx`, `src/app/account/delete.tsx`, Account tab rows.
- **Website rules kept:** notifications marked read on opening, Clear all, only links inside amcolink.com are followed (listing, shop and My ads open in the app, others open the website); delete account lists what is removed, needs the tick and typing DELETE, deletes photos first then calls `delete_my_account`, admin accounts cannot be deleted here.
- **Google Play:** an in-app delete-account path is required for apps with sign-up — this is it.
- **Tests:** link rule unit test. Real deletion only to be tried with a throwaway staging account.

## Task 12 — Wanted
- **Files:** `src/api/wanted.ts`, `src/app/wanted/index.tsx`, `src/app/wanted/new.tsx`, Explore tiles (Wanted, Post a need), Report supports Wanted.
- **Website rules kept:** open and not expired only; visitors never request the WhatsApp column (database also blocks it); My requests; same form checks; "I have it — WhatsApp" message text; I found it / Still looking / Delete; Report reasons for Wanted.
- **Not included:** admin removal (no admin in the app, by rule).
- **Tests:** 2 unit tests; staging visitor query test.

## Test run — build 8 (commit 3893100)
- Unit tests 45/45 passed; staging integration tests 20/20 passed; APK built (release `test-build-8`).
- Emulator (Android 14): 02-browse PASSED, 03-account PASSED, 01-smoke FAILED only because the "connected to STAGING" line is now below the screen on the longer Account page (test now scrolls to it). 12 screenshots in `ci-results/emulator-8/`.
- Finding: visitors can run `shop_name_available` on staging (repository grants it to signed-in people only). Low risk; reported, nothing changed.

## Test run — build 9 (commit 80a1ff9)
- Unit 45/45, staging integration 20/20, APK `test-build-9`, emulator flows 3/3 PASSED.

## Task 13 — Edit listing (Shopping and Services)
- **Files:** `src/app/edit-ad/[id].tsx`, `src/components/PhotoEditor.tsx`, `buildAdEdit`/`saveAdEdit` in `src/api/postAd.ts`; Edit button in My ads and on your own listing page.
- **Website rules kept (AdEditForm):** same checks and messages; unchanged old expiry date allowed; at least one photo; removed photo files deleted after saving; `price_from` cleared when leaving Services; price drops are saved like on the website (the database then records the drop for Deals and saved-item alerts).
- **Property listings:** edited on the website for now (button opens it).
- **Tests:** 3 unit tests. Not yet tried on a device (needs sign-in).

## Task 14 — Edit profile
- **Files:** `src/app/edit-profile/[id].tsx`, `updateShop` in `src/api/seller.ts`; Edit profile button in My ads.
- **In the app:** name (with name-taken check), country/region/town, phone, WhatsApp, announcement, building/floor/stall, street, directions, description, logo and cover (uploaded to `shop-media` like the website).
- **Kept unchanged on save:** opening hours, links, map pin, hours note — sent back exactly as stored (unit test proves nothing is lost); edited on the website for now.
- **Tests:** 1 unit test (round trip). Not yet on a device.
