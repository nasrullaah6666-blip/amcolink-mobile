# Android test build 7
commit: 6e4e38d543b2a8058b9bb2556a835d1329393269
key: success | install: success | checks: success | integration: failure | prebuild: skipped | gradle: skipped | release: skipped

## ci-logs/checks.log (last 120 lines)
```

> amcolink-mobile@1.0.0 check
> npm run typecheck && npm run check:design && npm run test


> amcolink-mobile@1.0.0 typecheck
> tsc --noEmit


> amcolink-mobile@1.0.0 check:design
> node scripts/check-design.js

design check ok: all colours come from src/theme/tokens.ts

> amcolink-mobile@1.0.0 test
> jest --ci

PASS src/api/__tests__/listings.test.ts
PASS src/components/__tests__/AuthForm.test.tsx (5.822 s)
PASS src/api/__tests__/postAd.test.ts
PASS src/lib/__tests__/config.test.ts
PASS src/api/__tests__/me.test.ts
PASS src/lib/__tests__/secureStorage.test.ts
PASS src/components/__tests__/ListingCard.test.tsx
PASS src/api/__tests__/wanted.test.ts
PASS src/core/__tests__/core.test.ts
PASS src/api/__tests__/account.test.ts

Test Suites: 10 passed, 10 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        9.546 s
Ran all test suites.
```

## ci-logs/install.log (last 120 lines)
```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: react-reconciler@0.34.0
npm warn Found: react@19.2.0
npm warn node_modules/react
npm warn   react@"19.2.0" from the root project
npm warn   71 more (@expo/devtools, @expo/dom-webview, @expo/log-box, ...)
npm warn
npm warn Could not resolve dependency:
npm warn peer react@"^19.3.0" from react-reconciler@0.34.0
npm warn node_modules/test-renderer/node_modules/react-reconciler
npm warn   react-reconciler@"~0.34.0" from test-renderer@1.3.1
npm warn   node_modules/test-renderer
npm warn
npm warn Conflicting peer dependency: react@19.3.1
npm warn node_modules/react
npm warn   peer react@"^19.3.0" from react-reconciler@0.34.0
npm warn   node_modules/test-renderer/node_modules/react-reconciler
npm warn     react-reconciler@"~0.34.0" from test-renderer@1.3.1
npm warn     node_modules/test-renderer
npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead
npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

added 948 packages, and audited 949 packages in 23s

89 packages are looking for funding
  run `npm fund` for details

24 vulnerabilities (8 low, 11 moderate, 5 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

## ci-logs/integration.log (last 120 lines)
```

> amcolink-mobile@1.0.0 test:integration
> jest --ci -c jest.integration.config.js

FAIL integration/staging.test.ts (12.57 s)
  ✓ signed-out visitors can read approved shops and published ads (1011 ms)
  ✓ the countries list is available (243 countries on staging) (348 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (336 ms)
  ✓ signed-out visitors can read the public Wanted columns (457 ms)
  ✓ signed-out visitors cannot create a shop (321 ms)
  ✓ signed-out visitors cannot create a report (332 ms)
  ✓ signed-out visitors cannot use admin functions (662 ms)
  ✓ public trending lists can be read signed out (342 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (324 ms)
  ✓ notifications are private (335 ms)
  ✓ app query: latest finds runs on staging (701 ms)
  ✓ app query: category page with every filter runs on staging (687 ms)
  ✓ app query: properties for rent and for sale run on staging (657 ms)
  ✓ app query: search runs on staging (348 ms)
  ✓ app query: Explore collections run on staging (1132 ms)
  ✓ app query: shop profile lookup and trust run on staging (663 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (626 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (524 ms)
  ✕ profile name check is for signed-in people only (as on the website) (331 ms)
  ✕ app query: Wanted list runs on staging as a visitor (1 ms)

  ● profile name check is for signed-in people only (as on the website)

    expect(received).not.toBeNull()

    Received: null

    [0m [90m 16 |[39m [90m/** A refusal must come from the database or auth server, never from a network failure. */[39m
     [90m 17 |[39m [36mfunction[39m expectRefused(error[33m:[39m { message[33m?[39m[33m:[39m string[33m;[39m code[33m?[39m[33m:[39m string[33m;[39m status[33m?[39m[33m:[39m number } [33m|[39m [36mnull[39m) {
    [31m[1m>[22m[39m[90m 18 |[39m   expect(error)[33m.[39mnot[33m.[39mtoBeNull()[33m;[39m
     [90m    |[39m                     [31m[1m^[22m[39m
     [90m 19 |[39m   expect([33mString[39m(error[33m?[39m[33m.[39mmessage [33m?[39m[33m?[39m [32m''[39m))[33m.[39mnot[33m.[39mtoMatch([35m/fetch failed|network|ENOTFOUND|ECONNREFUSED|timeout/i[39m)[33m;[39m
     [90m 20 |[39m }
     [90m 21 |[39m[0m

      at toBeNull (integration/staging.test.ts:18:21)
      at Object.expectRefused (integration/staging.test.ts:135:3)
      at asyncGeneratorStep (node_modules/@babel/runtime/helpers/asyncToGenerator.js:3:17)
      at _next (node_modules/@babel/runtime/helpers/asyncToGenerator.js:17:9)

  ● app query: Wanted list runs on staging as a visitor

    TypeError: A dynamic import callback was invoked without --experimental-vm-modules

    [0m [90m 137 |[39m
     [90m 138 |[39m test([32m'app query: Wanted list runs on staging as a visitor'[39m[33m,[39m [36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 139 |[39m   [36mconst[39m { fetchWanted } [33m=[39m [36mawait[39m [36mimport[39m([32m'../src/api/wanted'[39m)[33m;[39m
     [90m     |[39m   [31m[1m^[22m[39m
     [90m 140 |[39m   [36mawait[39m expect(fetchWanted({ signedIn[33m:[39m [36mfalse[39m[33m,[39m city[33m:[39m [32m'Nairobi'[39m[33m,[39m category[33m:[39m [32m'Other'[39m }[33m,[39m db))[33m.[39mresolves[33m.[39mtoEqual(expect[33m.[39many([33mArray[39m))[33m;[39m
     [90m 141 |[39m })[33m;[39m
     [90m 142 |[39m[0m

      at Object.<anonymous> (integration/staging.test.ts:139:3)
      at asyncGeneratorStep (node_modules/@babel/runtime/helpers/asyncToGenerator.js:3:17)
      at _next (node_modules/@babel/runtime/helpers/asyncToGenerator.js:17:9)
      at node_modules/@babel/runtime/helpers/asyncToGenerator.js:22:7
      at Object.<anonymous> (node_modules/@babel/runtime/helpers/asyncToGenerator.js:14:12)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 18 passed, 20 total
Snapshots:   0 total
Time:        12.677 s
Ran all test suites.
```
