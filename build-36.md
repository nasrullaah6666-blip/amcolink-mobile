# Android test build 36
commit: 619ace35f2a9a63ab8a5e6b501ec86baaa33cff0
key: success | install: success | checks: success | integration: success | prebuild: success | gradle: success | release: success

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
PASS src/lib/__tests__/config.test.ts
PASS src/core/__tests__/core.test.ts
PASS src/api/__tests__/me.test.ts
PASS src/lib/__tests__/secureStorage.test.ts
PASS src/api/__tests__/aiSuggest.test.ts
PASS src/api/__tests__/wanted.test.ts
PASS src/lib/__tests__/priceDrops.test.ts
PASS src/core/__tests__/shopEdit.test.ts
PASS src/lib/__tests__/recent.test.ts
PASS src/api/__tests__/account.test.ts
PASS src/components/__tests__/ListingCard.test.tsx (5.591 s)
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

PASS src/components/__tests__/AuthForm.test.tsx (8.164 s)
PASS src/components/__tests__/filters.test.ts (7.217 s)

Test Suites: 15 passed, 15 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        11.594 s
Ran all test suites.
```

## ci-logs/gradle.log (last 120 lines)
```
> Task :react-native-reanimated:buildCMakeRelWithDebInfo[x86][reanimated]
> Task :react-native-reanimated:buildCMakeRelWithDebInfo[x86_64][reanimated]
> Task :react-native-reanimated:externalNativeBuildRelease
> Task :react-native-reanimated:prefabReleasePackage
> Task :react-native-reanimated:mergeReleaseNativeLibs

> Task :react-native-reanimated:compileReleaseJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.

> Task :react-native-reanimated:bundleLibCompileToJarRelease
> Task :react-native-reanimated:bundleLibRuntimeToDirRelease
> Task :react-native-reanimated:copyReleaseJniLibsProjectOnly
> Task :react-native-reanimated:bundleLibRuntimeToJarRelease
> Task :react-native-reanimated:generateReleaseLintModel
> Task :react-native-reanimated:createFullJarRelease
> Task :react-native-reanimated:extractReleaseAnnotations
> Task :react-native-reanimated:mergeReleaseGeneratedProguardFiles
> Task :react-native-reanimated:mergeReleaseConsumerProguardFiles
> Task :react-native-reanimated:syncReleaseLibJars
> Task :react-native-reanimated:stripReleaseDebugSymbols
> Task :react-native-reanimated:lintVitalAnalyzeRelease
> Task :react-native-reanimated:generateReleaseLintVitalModel
> Task :react-native-reanimated:mapReleaseSourceSetPaths
> Task :react-native-reanimated:copyReleaseJniLibsProjectAndLocalJars
> Task :react-native-reanimated:mergeReleaseResources
> Task :react-native-reanimated:bundleReleaseLocalLintAar
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-gesture-handler:configureCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-gesture-handler:configureCMakeRelWithDebInfo[x86]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[x86]
> Task :react-native-gesture-handler:configureCMakeRelWithDebInfo[x86_64]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[x86_64]
> Task :react-native-gesture-handler:mergeReleaseNativeLibs
> Task :react-native-gesture-handler:copyReleaseJniLibsProjectOnly
> Task :react-native-gesture-handler:stripReleaseDebugSymbols
> Task :react-native-gesture-handler:copyReleaseJniLibsProjectAndLocalJars
> Task :react-native-gesture-handler:mapReleaseSourceSetPaths
> Task :app:buildCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-gesture-handler:mergeReleaseResources
> Task :react-native-reanimated:bundleReleaseAar
> Task :react-native-gesture-handler:verifyReleaseResources
> Task :react-native-reanimated:verifyReleaseResources
> Task :react-native-reanimated:assembleRelease

> Task :react-native-gesture-handler:compileReleaseKotlin
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/Extensions.kt:8:8 'class UIManagerModule : ReactContextBaseJavaModule, OnBatchCompleteListener, LifecycleEventListener, UIManager' is deprecated. Deprecated in Java.
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/Extensions.kt:13:29 'class UIManagerModule : ReactContextBaseJavaModule, OnBatchCompleteListener, LifecycleEventListener, UIManager' is deprecated. Deprecated in Java.
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/Extensions.kt:14:32 'class UIManagerModule : ReactContextBaseJavaModule, OnBatchCompleteListener, LifecycleEventListener, UIManager' is deprecated. Deprecated in Java.
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/RNGestureHandlerModule.kt:173:53 This synthetic property is based on the getter function 'fun getRootViewTag(): Int' from Kotlin. In the future, synthetic properties will be available only if the base getter function came from Java. Consider replacing this property access with a 'getRootViewTag()' function call.

> Task :react-native-gesture-handler:compileReleaseJavaWithJavac
> Task :react-native-gesture-handler:bundleLibCompileToJarRelease
> Task :react-native-gesture-handler:bundleLibRuntimeToJarRelease
> Task :react-native-gesture-handler:processReleaseJavaRes
> Task :react-native-gesture-handler:createFullJarRelease
> Task :react-native-gesture-handler:bundleLibRuntimeToDirRelease
> Task :react-native-gesture-handler:generateReleaseLintModel
> Task :react-native-gesture-handler:extractReleaseAnnotations
> Task :react-native-gesture-handler:mergeReleaseGeneratedProguardFiles
> Task :react-native-gesture-handler:mergeReleaseConsumerProguardFiles
> Task :react-native-gesture-handler:mergeReleaseJavaResource
> Task :react-native-gesture-handler:syncReleaseLibJars
> Task :react-native-gesture-handler:bundleReleaseLocalLintAar
> Task :react-native-gesture-handler:generateReleaseLintVitalModel
> Task :react-native-gesture-handler:bundleReleaseAar
> Task :react-native-gesture-handler:assembleRelease
> Task :react-native-gesture-handler:lintVitalAnalyzeRelease
> Task :app:configureCMakeRelWithDebInfo[armeabi-v7a]
> Task :app:buildCMakeRelWithDebInfo[armeabi-v7a]
> Task :app:configureCMakeRelWithDebInfo[x86]
> Task :app:buildCMakeRelWithDebInfo[x86]
> Task :app:configureCMakeRelWithDebInfo[x86_64]
> Task :app:buildCMakeRelWithDebInfo[x86_64]

> Task :app:expoReleaseOverrideMaxSdkConflicts
[33m---------- Expo Max Sdk Override Plugin ----------[0m
[32m>>> No 'android:maxSdkVersion' conflicts found[0m
[33m--------------------------------------------------[0m

> Task :app:processReleaseManifest
> Task :app:processReleaseManifestForPackage
> Task :app:mergeReleaseArtProfile
> Task :app:mergeReleaseNativeLibs
> Task :app:mergeReleaseAssets
> Task :app:compressReleaseAssets
> Task :app:stripReleaseDebugSymbols
> Task :app:processReleaseResources
> Task :app:extractReleaseNativeSymbolTables
> Task :app:optimizeReleaseResources
> Task :app:compileReleaseKotlin
> Task :app:compileReleaseJavaWithJavac
> Task :app:mergeReleaseNativeDebugMetadata
> Task :app:dexBuilderRelease
> Task :app:mergeReleaseGlobalSynthetics
> Task :app:generateReleaseLintVitalReportModel
> Task :app:processReleaseJavaRes
> Task :app:lintVitalAnalyzeRelease
> Task :app:lintVitalReportRelease
> Task :app:lintVitalRelease
> Task :app:mergeDexRelease
> Task :app:compileReleaseArtProfile
> Task :app:mergeReleaseJavaResource
> Task :app:packageRelease
> Task :app:createReleaseApkListingFileRedirect
> Task :app:assembleRelease

[Incubating] Problems report is available at: file:///home/runner/work/amcolink-mobile/amcolink-mobile/android/build/reports/problems/problems-report.html

Deprecated Gradle features were used in this build, making it incompatible with Gradle 10.

You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.

For more on this, please refer to https://docs.gradle.org/9.0.0/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.

BUILD SUCCESSFUL in 18m 54s
697 actionable tasks: 697 executed
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

added 959 packages, and audited 960 packages in 17s

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

PASS integration/staging.test.ts (12.235 s)
  ✓ signed-out visitors can read approved shops and published ads (1442 ms)
  ✓ the countries list is available (243 countries on staging) (237 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (553 ms)
  ✓ signed-out visitors can read the public Wanted columns (579 ms)
  ✓ signed-out visitors cannot create a shop (498 ms)
  ✓ signed-out visitors cannot create a report (200 ms)
  ✓ signed-out visitors cannot use admin functions (399 ms)
  ✓ public trending lists can be read signed out (224 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (504 ms)
  ✓ notifications are private (184 ms)
  ✓ app query: latest finds runs on staging (434 ms)
  ✓ app query: category page with every filter runs on staging (382 ms)
  ✓ app query: properties for rent and for sale run on staging (720 ms)
  ✓ app query: search runs on staging (215 ms)
  ✓ app query: Explore collections run on staging (857 ms)
  ✓ app query: shop profile lookup and trust run on staging (394 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (586 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (405 ms)
  ✓ profile name check answers yes/no (visitors can run it on staging — see note) (188 ms)
  ✓ app query: Wanted list runs on staging as a visitor (212 ms)
  ✓ app query: Gifts and Trending run on staging as a visitor (1109 ms)
  ✓ reviews: visitors can read them and are told to sign in before reviewing (370 ms)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        12.307 s
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
