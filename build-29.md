# Android test build 29
commit: 020751f8ae79d3e05a3c2dd3c72eebd2a5e387fd
key: success | install: success | checks: success | integration: success | prebuild: success | gradle: cancelled | release: skipped

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

PASS src/api/__tests__/postAd.test.ts
PASS src/api/__tests__/listings.test.ts
PASS src/components/__tests__/AuthForm.test.tsx
PASS src/core/__tests__/core.test.ts
PASS src/lib/__tests__/config.test.ts
PASS src/api/__tests__/me.test.ts
PASS src/lib/__tests__/secureStorage.test.ts
PASS src/api/__tests__/aiSuggest.test.ts
PASS src/components/__tests__/ListingCard.test.tsx
  ● Console

    console.warn
      expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53. Use a development build instead of Expo Go. Learn more at https://docs.expo.dev/develop/development-builds/introduction/.

    [0m [90m 1 |[39m [36mimport[39m { [33mPlatform[39m } [36mfrom[39m [32m'react-native'[39m[33m;[39m
     [90m 2 |[39m [36mimport[39m [33mConstants[39m [36mfrom[39m [32m'expo-constants'[39m[33m;[39m
    [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m [33m*[39m [36mas[39m [33mNotifications[39m [36mfrom[39m [32m'expo-notifications'[39m[33m;[39m
     [90m   |[39m [31m[1m^[22m[39m
     [90m 4 |[39m [36mimport[39m { router } [36mfrom[39m [32m'expo-router'[39m[33m;[39m
     [90m 5 |[39m [36mimport[39m [33m*[39m [36mas[39m [33mWebBrowser[39m [36mfrom[39m [32m'expo-web-browser'[39m[33m;[39m
     [90m 6 |[39m [36mimport[39m { db } [36mfrom[39m [32m'@/api/db'[39m[33m;[39m[0m

      at warn (node_modules/expo-notifications/src/warnOfExpoGoPushUsage.ts:14:15)
      at addPushTokenListener (node_modules/expo-notifications/src/TokenEmitter.ts:44:24)
      at Object.<anonymous> (node_modules/expo-notifications/src/DevicePushTokenAutoRegistration.fx.ts:104:23)
      at Object.require (node_modules/expo-notifications/src/getExpoPushTokenAsync.ts:5:1)
      at Object.require (node_modules/expo-notifications/src/index.ts:16:1)
      at Object.require (src/lib/push.ts:3:1)
      at Object.require (src/components/SaveButton.tsx:7:1)
      at Object.require (src/components/ListingCard.tsx:6:1)
      at Object.require (src/components/__tests__/ListingCard.test.tsx:3:1)

PASS src/api/__tests__/wanted.test.ts
PASS src/lib/__tests__/priceDrops.test.ts
PASS src/core/__tests__/shopEdit.test.ts
PASS src/lib/__tests__/recent.test.ts
PASS src/api/__tests__/account.test.ts
PASS src/components/__tests__/filters.test.ts

Test Suites: 15 passed, 15 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        12.575 s
Ran all test suites.
```

## ci-logs/gradle.log (last 120 lines)
```
> Task :expo-modules-core:generateReleaseBuildConfig
> Task :expo-modules-core:generateReleaseResValues
> Task :expo-modules-core:generateReleaseResources
> Task :expo-modules-core:packageReleaseResources
> Task :expo-modules-core:parseReleaseLocalResources
> Task :expo-modules-core:generateReleaseRFile
> Task :expo-modules-core:javaPreCompileRelease
> Task :expo-constants:javaPreCompileRelease
> Task :expo-log-box:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-log-box:generateReleaseBuildConfig
> Task :expo-log-box:generateReleaseResValues
> Task :expo-log-box:generateReleaseResources
> Task :expo-log-box:packageReleaseResources
> Task :expo-log-box:parseReleaseLocalResources
> Task :expo-log-box:generateReleaseRFile
> Task :expo-log-box:javaPreCompileRelease
> Task :expo:javaPreCompileRelease
> Task :react-native-svg:bundleLibRuntimeToDirRelease
> Task :react-native-worklets:buildCMakeRelWithDebInfo[x86][worklets]
> Task :react-native-view-shot:generateReleaseBuildConfig
> Task :react-native-view-shot:generateReleaseResValues
> Task :react-native-view-shot:generateReleaseResources
> Task :react-native-view-shot:packageReleaseResources
> Task :react-native-view-shot:parseReleaseLocalResources
> Task :react-native-view-shot:generateReleaseRFile
> Task :react-native-view-shot:javaPreCompileRelease

> Task :react-native-view-shot:compileReleaseJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.

> Task :react-native-view-shot:bundleLibRuntimeToDirRelease
> Task :app:checkReleaseDuplicateClasses
> Task :app:buildKotlinToolingMetadata
> Task :app:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :app:generateReleaseBuildConfig
> Task :expo:writeReleaseAarMetadata
> Task :expo-constants:writeReleaseAarMetadata
> Task :expo-log-box:writeReleaseAarMetadata
> Task :expo-modules-core:writeReleaseAarMetadata
> Task :react-native-async-storage_async-storage:writeReleaseAarMetadata
> Task :react-native-gesture-handler:writeReleaseAarMetadata
> Task :react-native-reanimated:writeReleaseAarMetadata
> Task :react-native-safe-area-context:writeReleaseAarMetadata
> Task :react-native-screens:writeReleaseAarMetadata
> Task :react-native-svg:writeReleaseAarMetadata
> Task :react-native-view-shot:writeReleaseAarMetadata
> Task :react-native-webview:writeReleaseAarMetadata

> Task :app:createBundleReleaseJsAndAssets
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

Android node_modules/expo-router/entry.js ░░░░░░░░░░░░░░░░  0.0% (0/1)
Android node_modules/expo-router/entry.js ▓▓▓░░░░░░░░░░░░░ 21.0% ( 47/243)
Android node_modules/expo-router/entry.js ▓▓▓░░░░░░░░░░░░░ 21.0% ( 83/314)

> Task :react-native-worklets:configureCMakeRelWithDebInfo[x86_64]

> Task :app:createBundleReleaseJsAndAssets
Android node_modules/expo-router/entry.js ▓▓▓░░░░░░░░░░░░░ 21.0% (159/445)
Android node_modules/expo-router/entry.js ▓▓▓░░░░░░░░░░░░░ 21.0% (170/464)
Android node_modules/expo-router/entry.js ▓▓▓░░░░░░░░░░░░░ 21.0% (269/590)
Android node_modules/expo-router/entry.js ▓▓▓▓░░░░░░░░░░░░ 27.0% (389/748)
Android node_modules/expo-router/entry.js ▓▓▓▓░░░░░░░░░░░░ 28.8% (425/793)
Android node_modules/expo-router/entry.js ▓▓▓▓▓░░░░░░░░░░░ 32.4% (459/806)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓░░░░░░░░░░ 38.5% (544/881)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓░░░░░░░░░░ 43.6% (620/939)

> Task :react-native-worklets:buildCMakeRelWithDebInfo[x86_64][worklets]

> Task :app:createBundleReleaseJsAndAssets
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓░░░░░░░░ 53.7% (716/977)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓░░░░░░░ 57.1% ( 778/1071)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓░░░░░░░ 62.5% ( 875/1111)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓░░░░░░ 68.4% ( 932/1127)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓░░░░░ 71.1% ( 962/1141)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓░░░░░ 74.7% (1009/1168)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 77.3% (1144/1318)

> Task :react-native-worklets:externalNativeBuildRelease
> Task :react-native-worklets:generateJsonModelRelease
> Task :react-native-worklets:prefabReleaseConfigurePackage
> Task :react-native-reanimated:configureCMakeRelWithDebInfo[arm64-v8a]

> Task :app:createBundleReleaseJsAndAssets
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 78.0% (1283/1462)

> Task :react-native-reanimated:configureCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-reanimated:configureCMakeRelWithDebInfo[x86]
> Task :react-native-reanimated:configureCMakeRelWithDebInfo[x86_64]
> Task :react-native-reanimated:generateJsonModelRelease
> Task :react-native-reanimated:prefabReleaseConfigurePackage
> Task :react-native-worklets:prefabReleasePackage

> Task :app:createBundleReleaseJsAndAssets
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 78.0% (1336/1577)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 78.0% (1398/1635)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 78.0% (1502/1713)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 83.8% (1583/1735)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 84.9% (1627/1766)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 85.9% (1637/1766)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ 91.0% (1702/1784)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ 92.3% (1761/1841)

> Task :react-native-reanimated:buildCMakeRelWithDebInfo[arm64-v8a][reanimated]

> Task :app:createBundleReleaseJsAndAssets
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 94.7% (1866/1921)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 99.9% (1937/1937)
Android Bundled 103819ms node_modules/expo-router/entry.js (1937 modules)
Writing bundle output to: /home/runner/work/amcolink-mobile/amcolink-mobile/android/app/build/generated/assets/react/release/index.android.bundle
Writing sourcemap output to: /home/runner/work/amcolink-mobile/amcolink-mobile/android/app/build/intermediates/sourcemaps/react/release/index.android.bundle.packager.map
Copying 50 asset files
Done writing bundle output
Done writing sourcemap output

> Task :app:configureCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-reanimated:buildCMakeRelWithDebInfo[armeabi-v7a][reanimated]
```

## ci-logs/install.log (last 120 lines)
```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: react-reconciler@0.34.0
npm warn Found: react@19.2.0
npm warn node_modules/react
npm warn   react@"19.2.0" from the root project
npm warn   74 more (@expo/devtools, @expo/dom-webview, @expo/log-box, ...)
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
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead

added 959 packages, and audited 960 packages in 13s

89 packages are looking for funding
  run `npm fund` for details

25 vulnerabilities (8 low, 12 moderate, 5 high)

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

PASS integration/staging.test.ts (9.544 s)
  ✓ signed-out visitors can read approved shops and published ads (949 ms)
  ✓ the countries list is available (243 countries on staging) (158 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (409 ms)
  ✓ signed-out visitors can read the public Wanted columns (176 ms)
  ✓ signed-out visitors cannot create a shop (377 ms)
  ✓ signed-out visitors cannot create a report (176 ms)
  ✓ signed-out visitors cannot use admin functions (523 ms)
  ✓ public trending lists can be read signed out (153 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (156 ms)
  ✓ notifications are private (132 ms)
  ✓ app query: latest finds runs on staging (315 ms)
  ✓ app query: category page with every filter runs on staging (533 ms)
  ✓ app query: properties for rent and for sale run on staging (282 ms)
  ✓ app query: search runs on staging (147 ms)
  ✓ app query: Explore collections run on staging (538 ms)
  ✓ app query: shop profile lookup and trust run on staging (301 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (623 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (345 ms)
  ✓ profile name check answers yes/no (visitors can run it on staging — see note) (139 ms)
  ✓ app query: Wanted list runs on staging as a visitor (137 ms)
  ✓ app query: Gifts and Trending run on staging as a visitor (833 ms)
  ✓ reviews: visitors can read them and are told to sign in before reviewing (311 ms)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        9.627 s
Ran all test suites.
```

## ci-logs/prebuild.log (last 120 lines)
```
- Clearing android
✔ Cleared android code
- Creating native directory (./android)
✔ Created native directory
- Updating package.json
✔ Updated package.json
- Running prebuild
✔ Finished prebuild
```
