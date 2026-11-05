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

## Task 15 — Post property (rent and sale)
- **Files:** `src/components/PropertyFields.tsx`, `buildPropertyAd`/`saveProfileRole` in `src/api/postAd.ts`, Properties option in Post Ad.
- **Website rules kept:** the website's own `parseRental` checks the details (type, area, period, bedrooms, furnished, size for land, deposit, agent fee, included items, available-from); rent or sale is chosen by the poster, never defaulted; owner/agent asked once and saved on the profile; rent/sale price required; rental rules text and tick.
- **Still on the website:** editing a property listing.
- **Tests:** 2 unit tests. Not yet on a device.

## Task 16 — Country choice
- **Files:** `src/lib/countryPref.tsx`, Home country pill, country passed to Home, categories, search, property, Explore collections and Wanted.
- **Website rules kept (CountrySwitcher):** default All countries; East Africa first in the list; remembered on the phone; lists filter by the shop's country (Wanted by the request's country; "My requests" not filtered).
- **Tests:** emulator flow `04-country`.

## Test run — build 11 (commit b9ad668, first build with the security-check key)
- Unit 45/45, staging 20/20, emulator 3/3 PASSED. The Cloudflare check loads on Sign in and Create account ("Verifying…"). Home and Property show the staging [TEST] listings and photos.

## Task 17 — Categories follow the website (website commit d3ef747, deployed 5 Nov 2026)
- `src/core/categories.ts` copied again: Vehicles + Trucks & buses (Parts first); Services + Printing & branding, Catering & food, Car services; shared tiles (Car services on Vehicles, Repairs & technicians on Phones) open the other category, as on the website.
- Database lists updated on staging and production by the owner (migration 046 in the website repo).

## Task 18 — Saved searches and alerts
- **Files:** `src/components/SaveSearchButton.tsx`, saved-search functions in `src/api/me.ts`, Saved tab section, Save search on Search and on a filtered category page.
- **Website rules kept (SaveSearchButton, SavedSearchList, app/favorites):** same label (`describeSearch`) and stored query (`searchParamsOf`, sort left out), so a search saved in the app opens on the website and the other way; bell turns alerts on/off; delete; property searches open Property.
- **Alerts themselves** are sent by the existing database job as notifications (shown in the app's Notifications). Push to the phone is not built (needs your approval).
- **Not yet on a device** (needs sign-in).

## Fix — bottom bar hidden behind the phone's buttons (found by the owner on a real phone, build 11)
- On phones with on-screen buttons (|||  ○  <) the tab bar had a fixed height and sat under them, so Home/Saved/Post Ad/Account were half hidden and hard to tap. The bar now adds the phone's bottom inset (`useSafeAreaInsets`). First physical-device finding.

## Physical phone test — owner, build 11, 5 Nov 2026 (first real-device results)
- **Passed:** app installs and runs; Home shows staging test listings with photos; create account + email confirmation + sign in with the security check; saving listings (heart) and the Saved tab (4 items shown with photo, title, price, "Free").
- **Failed → fixed:** bottom bar hidden behind the phone's on-screen buttons (fixed in commit b8bdc91, build 13).
- Website categories deploy (website commit d3ef747) confirmed live by the owner: Vehicles page shows Parts, Cars, Motorbikes & tuk-tuks, Trucks & buses, Other vehicles, Car services.

## Test run — build 13 (commit b8bdc91)
- Unit 52/52, staging 20/20, APK `test-build-13`. Emulator: 01-smoke, 02-browse, 03-account, 04-country PASSED; 05-listings failed only because the test looked for a listing below the screen without scrolling (test fixed).
- Country choice confirmed on the emulator: pill shows "Kenya" after choosing it, back to "All countries".

## Task 19 — Trending and Gifts in Explore
- **Files:** `src/app/trending.tsx`, `src/app/gifts.tsx`, `fetchGifts` in `src/api/listings.ts`, `src/core/{trending,gifts}.ts` (copied from the website), Explore now has all 8 website tiles in the website's order, new icons (tag, trend, gift, sparkle, recycle).
- **Website rules kept:** Trending = top 10 items by unique viewers and top 10 shops by unique contacts in 7 days (database functions `trending_ads`/`trending_shops`), country and blocked shops applied; Gifts = items tagged by occasion and/or who it is for, "All"/"Everyone" chips, sorting.
- **Tests:** staging test runs both queries as a visitor.

## Task 20 — Shop reviews
- **Files:** `src/api/reviews.ts`, `src/components/ShopReviews.tsx`, shown at the bottom of every shop page.
- **Website rules kept (ShopReviews, ReviewForm, ReplyForm):** last 30 reviews; who may review is decided by the database (`review_status`: sign in first, contact the seller first, own shop, banned, already reviewed → edit); 1–5 stars + optional comment up to 500 characters; the shop owner can reply. Stars are Amcolink green in the app (the website uses amber; owner's green-only rule).
- **Tests:** staging test (visitor reads reviews and is told to sign in).

## Test run — build 14 (commit cb4cad7)
- Unit 52/52, staging 20/20, APK `test-build-14`. Emulator 4/5: the listing page (photos, price, Used/Phones tags, seller card, safety note, Call/WhatsApp) and the shop page (Follow, address, Map, Share, Report, Block, 4 ads) work with staging data.
- 05-listings stopped at Deals: Deals is empty on staging because the database resets the seeded price-drop fields when rows are inserted (the website would show the same). Test changed to record the Deals screen without expecting an item.

## Test run — build 15 (commit 7383df1)
- Unit 52/52, staging 22/22 (new: Gifts, Trending, reviews), APK `test-build-15`.
- Emulator 0/5: not an app fault — the emulator's own home-screen program froze ("Pixel Launcher isn't responding") and its dialog covered the app, which was running normally underneath (screenshot). Tests now wait for the emulator to settle, close system dialogs and tap "Wait" if that dialog appears.

## Physical phone test — owner, build 15, 5 Nov 2026
- **Passed:** bottom bar now fully visible above the phone's on-screen buttons (fix confirmed); hearts fill green when saved; Save search ("Tshirt") appears in Saved with alerts on; Explore shows all 8 tiles with their own icons; country pill shows "All countries".
- **Noted:** Explore leaves the lower two-thirds of the screen empty (owner's "no leftover empty space" rule) — options proposed to the owner, nothing changed yet.

## Task 21 — Share to WhatsApp Status (owner approved the drawing, "go", 5 Nov 2026)
- **Files:** `src/components/StatusShare.tsx` (new), button on `src/app/ads/[id].tsx` under the price and title; packages `react-native-view-shot` (draws the picture) and `expo-sharing` (opens the share screen).
- **What it does:** one tap makes a tall 1080×1920 picture (Status shape): Amcolink logo, the ad's main photo, price, title, condition and town, "See it and chat with the seller · amcolink.com". Then the phone's share screen opens; the person picks WhatsApp → My status (or any other app). Counts as a "share" in the seller's stats, like the existing Share button.
- **Backend:** none. Website unchanged.
- **Tests:** emulator flow `06-status-share` (button visible, share screen opens). Picking WhatsApp Status itself must be checked on a real phone (the emulator has no WhatsApp).

## Task 22 — Fill in the ad from a photo (owner "go", 5 Nov 2026)
- **App files:** `src/api/aiSuggest.ts` (new), Post Ad screen: green "Fill in the ad from my photo" button under the photos (Shopping and Services, once a photo is added), the note "Filled in from your photo. Check every detail before you publish.", and the website's "AI estimate … Use …" price hint.
- **Website rules kept (AdForm fillWithAI + app/api/ai/suggest):** the AI only looks at the seller's own uploaded photo; title, description, category, kind and condition are filled in; the price is never filled in automatically (the seller taps "Use …" or types it); 20 uses per person per day; nothing is published until the seller taps Publish.
- **Website change needed (prepared, NOT deployed — branch `ai-helper-app`, commit ff6a493d):** the helper only understood website sign-ins (cookies). It now also accepts the app's sign-in ("Bearer" token). Same checks; website behaviour unchanged. Website tests 47/47.
- **BLOCKED on owner:** (1) "deploy" for the website change; (2) `ANTHROPIC_API_KEY` set on Render (the website's own button also stays hidden until then).
- **Test limit:** the helper checks sign-ins against the production database, so it only works in the store (production) build. Test builds (staging) hide the button. It can only be tried for real once the store build is installed. Unit tests 56/56.

## Test run — build 17 (commit ba6deb4)
- Unit 52/52, staging tests passed, APK `test-build-17`. Emulator 4/5: 01-smoke, 02-browse, 03-account, 04-country PASSED (the launcher-dialog fix works); listing, shop and Deals screens recorded.
- 05-listings stopped at the last step: Home was still scrolled down from the listing step, so the "Property" tile was above the screen. Test fixed (scrolls up first). Not an app fault.

## Task 23 — Phone alerts, app side (owner "go" for #2, 5 Nov 2026)
- **Found on the website:** the database already writes alerts into `notifications` (price drop on a saved ad, new match for a saved search, ad approved/removed/in review, profile verified …) and already has a `push_tokens` table (migration 009). Missing: something that sends them to the phone.
- **App files:** `src/lib/push.ts` (new); `_layout.tsx` (keeps the token saved, opens the right screen when an alert is tapped — same targets as the Notifications list); the phone asks permission once, at a moment that explains itself: saving an ad, saving a search, or opening Notifications; Sign out removes this phone's token first.
- **Switched off** until the build has Firebase settings: CI writes `google-services.json` from the GitHub secret `GOOGLE_SERVICES_JSON` (file is git-ignored). Without it the build is unchanged and no permission is asked.
- **BLOCKED on owner:** Firebase project. Then: the sender (staging Supabase first) and #5 Wanted matching (new database rule, SQL).
