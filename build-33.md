# Android test build 33
commit: 9a03dc42f9cb0a0211679d4d96f8969d4b8b07ce
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
Time:        13.72 s
Ran all test suites.
```

## ci-logs/gradle.log (last 120 lines)
```
> Task :expo-log-box:mergeReleaseGeneratedProguardFiles
> Task :expo-log-box:mergeReleaseConsumerProguardFiles
> Task :expo-log-box:mergeReleaseJavaResource
> Task :expo-log-box:syncReleaseLibJars
> Task :expo-log-box:bundleReleaseLocalLintAar
> Task :expo-constants:stripReleaseDebugSymbols NO-SOURCE
> Task :expo-constants:copyReleaseJniLibsProjectAndLocalJars
> Task :expo-constants:extractDeepLinksForAarRelease
> Task :expo-constants:extractReleaseAnnotations
> Task :expo-constants:mergeReleaseGeneratedProguardFiles
> Task :expo-constants:mergeReleaseConsumerProguardFiles
> Task :expo-constants:mergeReleaseJavaResource
> Task :expo-constants:syncReleaseLibJars
> Task :expo-constants:bundleReleaseLocalLintAar
> Task :expo-constants:writeReleaseLintModelMetadata
> Task :expo-log-box:writeReleaseLintModelMetadata
> Task :expo-modules-core:writeReleaseLintModelMetadata
> Task :react-native-worklets:writeReleaseLintModelMetadata
> Task :expo:lintVitalAnalyzeRelease
> Task :expo:writeReleaseLintModelMetadata
> Task :expo-constants:lintVitalAnalyzeRelease
> Task :expo-log-box:lintVitalAnalyzeRelease
> Task :expo-modules-core:lintVitalAnalyzeRelease
> Task :react-native-reanimated:buildCMakeRelWithDebInfo[x86_64][reanimated]
> Task :react-native-async-storage_async-storage:lintVitalAnalyzeRelease
> Task :react-native-async-storage_async-storage:writeReleaseLintModelMetadata
> Task :react-native-svg:writeReleaseLintModelMetadata
> Task :react-native-gesture-handler:writeReleaseLintModelMetadata
> Task :react-native-safe-area-context:lintVitalAnalyzeRelease
> Task :react-native-safe-area-context:writeReleaseLintModelMetadata
> Task :react-native-screens:lintVitalAnalyzeRelease
> Task :react-native-screens:writeReleaseLintModelMetadata
> Task :react-native-svg:lintVitalAnalyzeRelease
> Task :react-native-view-shot:lintVitalAnalyzeRelease
> Task :react-native-view-shot:writeReleaseLintModelMetadata
> Task :react-native-webview:lintVitalAnalyzeRelease
> Task :react-native-webview:writeReleaseLintModelMetadata
> Task :react-native-worklets:lintVitalAnalyzeRelease
> Task :expo:generateReleaseLintVitalModel
> Task :expo-constants:generateReleaseLintVitalModel
> Task :expo-log-box:generateReleaseLintVitalModel
> Task :expo-modules-core:generateReleaseLintVitalModel
> Task :react-native-async-storage_async-storage:generateReleaseLintVitalModel
> Task :react-native-safe-area-context:generateReleaseLintVitalModel
> Task :react-native-screens:generateReleaseLintVitalModel
> Task :react-native-svg:generateReleaseLintVitalModel
> Task :react-native-view-shot:generateReleaseLintVitalModel
> Task :react-native-webview:generateReleaseLintVitalModel
> Task :react-native-worklets:generateReleaseLintVitalModel
> Task :app:collectReleaseDependencies
> Task :app:sdkReleaseDependencyData
> Task :app:validateSigningRelease
> Task :app:writeReleaseAppMetadata
> Task :app:writeReleaseSigningConfigVersions
> Task :expo:bundleReleaseAar
> Task :expo:mapReleaseSourceSetPaths
> Task :expo:mergeReleaseResources
> Task :expo:verifyReleaseResources
> Task :expo:assembleRelease
> Task :expo-constants:bundleReleaseAar
> Task :expo-constants:mapReleaseSourceSetPaths
> Task :expo-constants:mergeReleaseResources
> Task :expo-constants:verifyReleaseResources
> Task :expo-constants:assembleRelease
> Task :expo-log-box:bundleReleaseAar
> Task :expo-log-box:mapReleaseSourceSetPaths
> Task :expo-log-box:mergeReleaseResources
> Task :expo-log-box:verifyReleaseResources
> Task :expo-log-box:assembleRelease
> Task :expo-modules-core:bundleReleaseAar
> Task :expo-modules-core:mapReleaseSourceSetPaths
> Task :expo-modules-core:mergeReleaseResources
> Task :expo-modules-core:verifyReleaseResources
> Task :expo-modules-core:assembleRelease
> Task :react-native-async-storage_async-storage:bundleReleaseAar
> Task :react-native-async-storage_async-storage:mapReleaseSourceSetPaths
> Task :react-native-async-storage_async-storage:mergeReleaseResources
> Task :react-native-async-storage_async-storage:verifyReleaseResources
> Task :react-native-async-storage_async-storage:assembleRelease
> Task :react-native-gesture-handler:mapReleaseSourceSetPaths
> Task :react-native-gesture-handler:mergeReleaseResources
> Task :react-native-safe-area-context:bundleReleaseAar
> Task :react-native-safe-area-context:mapReleaseSourceSetPaths
> Task :react-native-safe-area-context:mergeReleaseResources
> Task :react-native-safe-area-context:verifyReleaseResources
> Task :react-native-safe-area-context:assembleRelease
> Task :react-native-screens:bundleReleaseAar
> Task :react-native-screens:mapReleaseSourceSetPaths
> Task :react-native-screens:mergeReleaseResources
> Task :react-native-screens:verifyReleaseResources
> Task :react-native-screens:assembleRelease
> Task :react-native-svg:bundleReleaseAar
> Task :react-native-svg:mapReleaseSourceSetPaths
> Task :react-native-svg:mergeReleaseResources
> Task :react-native-svg:verifyReleaseResources
> Task :react-native-svg:assembleRelease
> Task :react-native-view-shot:bundleReleaseAar
> Task :react-native-view-shot:mapReleaseSourceSetPaths
> Task :react-native-view-shot:mergeReleaseResources
> Task :react-native-view-shot:verifyReleaseResources
> Task :react-native-view-shot:assembleRelease
> Task :react-native-webview:bundleReleaseAar
> Task :react-native-webview:mapReleaseSourceSetPaths
> Task :react-native-webview:mergeReleaseResources
> Task :react-native-webview:verifyReleaseResources
> Task :react-native-webview:assembleRelease
> Task :react-native-worklets:bundleReleaseAar
> Task :react-native-worklets:mapReleaseSourceSetPaths
> Task :react-native-worklets:mergeReleaseResources
> Task :react-native-worklets:verifyReleaseResources
> Task :react-native-worklets:assembleRelease
> Task :react-native-reanimated:externalNativeBuildRelease
> Task :react-native-reanimated:prefabReleasePackage
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[x86]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[x86_64]
> Task :react-native-gesture-handler:mergeReleaseNativeLibs
> Task :react-native-gesture-handler:copyReleaseJniLibsProjectOnly
> Task :react-native-reanimated:mergeReleaseNativeLibs
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

added 959 packages, and audited 960 packages in 15s

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

PASS integration/staging.test.ts (13.677 s)
  ✓ signed-out visitors can read approved shops and published ads (1008 ms)
  ✓ the countries list is available (243 countries on staging) (224 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (562 ms)
  ✓ signed-out visitors can read the public Wanted columns (598 ms)
  ✓ signed-out visitors cannot create a shop (533 ms)
  ✓ signed-out visitors cannot create a report (227 ms)
  ✓ signed-out visitors cannot use admin functions (438 ms)
  ✓ public trending lists can be read signed out (214 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (540 ms)
  ✓ notifications are private (207 ms)
  ✓ app query: latest finds runs on staging (779 ms)
  ✓ app query: category page with every filter runs on staging (733 ms)
  ✓ app query: properties for rent and for sale run on staging (724 ms)
  ✓ app query: search runs on staging (238 ms)
  ✓ app query: Explore collections run on staging (897 ms)
  ✓ app query: shop profile lookup and trust run on staging (460 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (609 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (407 ms)
  ✓ profile name check answers yes/no (visitors can run it on staging — see note) (518 ms)
  ✓ app query: Wanted list runs on staging as a visitor (206 ms)
  ✓ app query: Gifts and Trending run on staging as a visitor (1145 ms)
  ✓ reviews: visitors can read them and are told to sign in before reviewing (423 ms)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        13.761 s
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
