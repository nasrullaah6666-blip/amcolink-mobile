# Android test build 8
commit: 3893100a6162b505e26d6e416966adaf98bf82e0
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

PASS src/api/__tests__/listings.test.ts
PASS src/components/__tests__/AuthForm.test.tsx (6.282 s)
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
Time:        10.15 s
Ran all test suites.
```

## ci-logs/gradle.log (last 120 lines)
```
> Task :react-native-webview:mergeReleaseResources
> Task :react-native-webview:verifyReleaseResources
> Task :react-native-webview:assembleRelease
> Task :react-native-worklets:bundleReleaseAar
> Task :react-native-worklets:mapReleaseSourceSetPaths
> Task :react-native-worklets:mergeReleaseResources
> Task :react-native-worklets:verifyReleaseResources
> Task :react-native-worklets:assembleRelease
> Task :react-native-reanimated:buildCMakeRelWithDebInfo[x86][reanimated]
> Task :react-native-reanimated:buildCMakeRelWithDebInfo[x86_64][reanimated]
> Task :react-native-reanimated:externalNativeBuildRelease
> Task :react-native-reanimated:prefabReleasePackage
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[x86]
> Task :react-native-gesture-handler:buildCMakeRelWithDebInfo[x86_64]
> Task :react-native-gesture-handler:mergeReleaseNativeLibs
> Task :react-native-gesture-handler:copyReleaseJniLibsProjectOnly
> Task :app:buildCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-reanimated:mergeReleaseNativeLibs
> Task :react-native-reanimated:copyReleaseJniLibsProjectOnly

> Task :react-native-reanimated:compileReleaseJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.

> Task :react-native-reanimated:bundleLibCompileToJarRelease

> Task :react-native-gesture-handler:compileReleaseKotlin
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/Extensions.kt:8:8 'class UIManagerModule : ReactContextBaseJavaModule, OnBatchCompleteListener, LifecycleEventListener, UIManager' is deprecated. Deprecated in Java.
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/Extensions.kt:13:29 'class UIManagerModule : ReactContextBaseJavaModule, OnBatchCompleteListener, LifecycleEventListener, UIManager' is deprecated. Deprecated in Java.
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/Extensions.kt:14:32 'class UIManagerModule : ReactContextBaseJavaModule, OnBatchCompleteListener, LifecycleEventListener, UIManager' is deprecated. Deprecated in Java.
w: file:///home/runner/work/amcolink-mobile/amcolink-mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/RNGestureHandlerModule.kt:173:53 This synthetic property is based on the getter function 'fun getRootViewTag(): Int' from Kotlin. In the future, synthetic properties will be available only if the base getter function came from Java. Consider replacing this property access with a 'getRootViewTag()' function call.

> Task :react-native-gesture-handler:compileReleaseJavaWithJavac
> Task :react-native-gesture-handler:bundleLibRuntimeToDirRelease
> Task :react-native-reanimated:bundleLibRuntimeToDirRelease
> Task :react-native-gesture-handler:bundleLibCompileToJarRelease
> Task :react-native-reanimated:prepareReleaseArtProfile
> Task :react-native-gesture-handler:bundleLibRuntimeToJarRelease
> Task :react-native-reanimated:bundleLibRuntimeToJarRelease
> Task :react-native-reanimated:mergeReleaseShaders
> Task :react-native-reanimated:compileReleaseShaders NO-SOURCE
> Task :react-native-reanimated:generateReleaseAssets UP-TO-DATE
> Task :react-native-reanimated:mergeReleaseAssets
> Task :react-native-gesture-handler:processReleaseJavaRes
> Task :react-native-gesture-handler:createFullJarRelease
> Task :react-native-reanimated:processReleaseJavaRes NO-SOURCE
> Task :react-native-reanimated:createFullJarRelease
> Task :react-native-reanimated:extractProguardFiles
> Task :react-native-reanimated:generateReleaseLintModel
> Task :react-native-reanimated:prepareLintJarForPublish
> Task :react-native-gesture-handler:generateReleaseLintModel
> Task :react-native-gesture-handler:stripReleaseDebugSymbols
> Task :react-native-gesture-handler:copyReleaseJniLibsProjectAndLocalJars
> Task :react-native-gesture-handler:extractReleaseAnnotations
> Task :react-native-gesture-handler:mergeReleaseGeneratedProguardFiles
> Task :react-native-gesture-handler:mergeReleaseConsumerProguardFiles
> Task :react-native-gesture-handler:mergeReleaseJavaResource
> Task :react-native-gesture-handler:syncReleaseLibJars
> Task :react-native-gesture-handler:bundleReleaseLocalLintAar
> Task :react-native-reanimated:stripReleaseDebugSymbols
> Task :react-native-reanimated:copyReleaseJniLibsProjectAndLocalJars
> Task :react-native-reanimated:extractDeepLinksForAarRelease
> Task :react-native-reanimated:extractReleaseAnnotations
> Task :react-native-reanimated:mergeReleaseGeneratedProguardFiles
> Task :react-native-reanimated:mergeReleaseConsumerProguardFiles
> Task :react-native-reanimated:mergeReleaseJavaResource
> Task :react-native-reanimated:syncReleaseLibJars
> Task :react-native-reanimated:bundleReleaseLocalLintAar
> Task :react-native-reanimated:writeReleaseLintModelMetadata
> Task :react-native-gesture-handler:lintVitalAnalyzeRelease
> Task :react-native-reanimated:lintVitalAnalyzeRelease
> Task :react-native-gesture-handler:generateReleaseLintVitalModel
> Task :react-native-reanimated:generateReleaseLintVitalModel
> Task :react-native-gesture-handler:bundleReleaseAar
> Task :react-native-gesture-handler:assembleRelease
> Task :react-native-reanimated:bundleReleaseAar
> Task :react-native-reanimated:mapReleaseSourceSetPaths
> Task :react-native-reanimated:mergeReleaseResources
> Task :react-native-reanimated:verifyReleaseResources
> Task :react-native-reanimated:assembleRelease
> Task :app:buildCMakeRelWithDebInfo[armeabi-v7a]
> Task :app:buildCMakeRelWithDebInfo[x86]
> Task :app:buildCMakeRelWithDebInfo[x86_64]
> Task :app:compileReleaseKotlin
> Task :app:compileReleaseJavaWithJavac
> Task :app:dexBuilderRelease
> Task :app:mergeReleaseNativeLibs
> Task :app:mergeDexRelease
> Task :app:mergeReleaseArtProfile
> Task :app:stripReleaseDebugSymbols
> Task :app:mergeReleaseGlobalSynthetics
> Task :app:compileReleaseArtProfile
> Task :app:extractReleaseNativeSymbolTables
> Task :app:mergeReleaseAssets
> Task :app:compressReleaseAssets
> Task :app:generateReleaseLintVitalReportModel
> Task :app:lintVitalAnalyzeRelease
> Task :app:lintVitalReportRelease
> Task :app:lintVitalRelease
> Task :app:processReleaseJavaRes
> Task :app:mergeReleaseNativeDebugMetadata
> Task :app:mergeReleaseJavaResource
> Task :app:packageRelease
> Task :app:createReleaseApkListingFileRedirect
> Task :app:assembleRelease

[Incubating] Problems report is available at: file:///home/runner/work/amcolink-mobile/amcolink-mobile/android/build/reports/problems/problems-report.html

Deprecated Gradle features were used in this build, making it incompatible with Gradle 10.

You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.

For more on this, please refer to https://docs.gradle.org/9.0.0/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.

BUILD SUCCESSFUL in 46m 25s
655 actionable tasks: 655 executed
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

added 948 packages, and audited 949 packages in 26s

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

PASS integration/staging.test.ts (12.318 s)
  ✓ signed-out visitors can read approved shops and published ads (946 ms)
  ✓ the countries list is available (243 countries on staging) (315 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (337 ms)
  ✓ signed-out visitors can read the public Wanted columns (433 ms)
  ✓ signed-out visitors cannot create a shop (327 ms)
  ✓ signed-out visitors cannot create a report (431 ms)
  ✓ signed-out visitors cannot use admin functions (482 ms)
  ✓ public trending lists can be read signed out (135 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (327 ms)
  ✓ notifications are private (335 ms)
  ✓ app query: latest finds runs on staging (687 ms)
  ✓ app query: category page with every filter runs on staging (690 ms)
  ✓ app query: properties for rent and for sale run on staging (453 ms)
  ✓ app query: search runs on staging (126 ms)
  ✓ app query: Explore collections run on staging (1363 ms)
  ✓ app query: shop profile lookup and trust run on staging (466 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (614 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (478 ms)
  ✓ profile name check answers yes/no (visitors can run it on staging — see note) (315 ms)
  ✓ app query: Wanted list runs on staging as a visitor (321 ms)

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        12.426 s
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
