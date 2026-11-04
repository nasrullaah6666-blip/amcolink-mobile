# Android test build 5
commit: ed8de261e2c117872b38d9ee68e71baabf119875
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
PASS src/lib/__tests__/config.test.ts
PASS src/lib/__tests__/secureStorage.test.ts
PASS src/components/__tests__/ListingCard.test.tsx
PASS src/core/__tests__/core.test.ts

Test Suites: 5 passed, 5 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        5.171 s
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

added 945 packages, and audited 946 packages in 14s

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

FAIL integration/staging.test.ts (10.052 s)
  ✓ signed-out visitors can read approved shops and published ads (1443 ms)
  ✓ the countries list is available (243 countries on staging) (260 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (203 ms)
  ✓ signed-out visitors can read the public Wanted columns (581 ms)
  ✓ signed-out visitors cannot create a shop (535 ms)
  ✓ signed-out visitors cannot create a report (504 ms)
  ✓ signed-out visitors cannot use admin functions (695 ms)
  ✓ public trending lists can be read signed out (192 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (485 ms)
  ✓ notifications are private (195 ms)
  ✓ app query: latest finds runs on staging (712 ms)
  ✓ app query: category page with every filter runs on staging (693 ms)
  ✓ app query: properties for rent and for sale run on staging (386 ms)
  ✓ app query: search runs on staging (208 ms)
  ✓ app query: Explore collections run on staging (1158 ms)
  ✕ app query: shop profile lookup and trust run on staging (188 ms)

  ● app query: shop profile lookup and trust run on staging

    expect(received).resolves.toBeNull()

    Received: []

    [0m [90m 109 |[39m
     [90m 110 |[39m test([32m'app query: shop profile lookup and trust run on staging'[39m[33m,[39m [36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 111 |[39m   [36mawait[39m expect(fetchShop([32m'no-such-shop-for-test'[39m[33m,[39m db))[33m.[39mresolves[33m.[39mtoBeNull()[33m;[39m
     [90m     |[39m                                                                 [31m[1m^[22m[39m
     [90m 112 |[39m   [36mconst[39m res [33m=[39m [36mawait[39m db[33m.[39mrpc([32m'shop_trust'[39m[33m,[39m { p_shops[33m:[39m [[32m'00000000-0000-0000-0000-000000000000'[39m] })[33m;[39m
     [90m 113 |[39m   expect(res[33m.[39merror)[33m.[39mtoBeNull()[33m;[39m
     [90m 114 |[39m   [36mawait[39m expect(getTrust(db[33m,[39m []))[33m.[39mresolves[33m.[39mtoBeInstanceOf([33mMap[39m)[33m;[39m[0m

      at Object.toBeNull (node_modules/@jest/expect/node_modules/expect/build/index.js:174:22)
      at Object.toBeNull (integration/staging.test.ts:111:65)
      at asyncGeneratorStep (node_modules/@babel/runtime/helpers/asyncToGenerator.js:3:17)
      at _next (node_modules/@babel/runtime/helpers/asyncToGenerator.js:17:9)
      at node_modules/@babel/runtime/helpers/asyncToGenerator.js:22:7
      at Object.<anonymous> (node_modules/@babel/runtime/helpers/asyncToGenerator.js:14:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 15 passed, 16 total
Snapshots:   0 total
Time:        10.13 s
Ran all test suites.
```
