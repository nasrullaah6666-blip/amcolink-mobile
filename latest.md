# Android test build 12
commit: 5c0dc1a75a0072227c9e3576dd5c17adb06c3edd
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
PASS src/components/__tests__/AuthForm.test.tsx (6.48 s)
PASS src/lib/__tests__/config.test.ts
PASS src/api/__tests__/me.test.ts
PASS src/lib/__tests__/secureStorage.test.ts
PASS src/components/__tests__/ListingCard.test.tsx
PASS src/api/__tests__/wanted.test.ts
PASS src/core/__tests__/core.test.ts
PASS src/core/__tests__/shopEdit.test.ts
PASS src/api/__tests__/account.test.ts

Test Suites: 11 passed, 11 total
Tests:       52 passed, 52 total
Snapshots:   0 total
Time:        10.531 s
Ran all test suites.
```

## ci-logs/gradle.log (last 120 lines)
```
> Task :expo-log-box:preBuild UP-TO-DATE
> Task :expo-modules-core:preBuild UP-TO-DATE
> Task :react-native-async-storage_async-storage:generateCodegenSchemaFromJavaScript
> Task :react-native-async-storage_async-storage:generateCodegenArtifactsFromSchema
> Task :react-native-async-storage_async-storage:preBuild

> Task :expo-constants:createExpoConfig
The NODE_ENV environment variable is required but was not specified. Ensure the project is bundled with Expo CLI or NODE_ENV is set. Using only .env.local and .env

> Task :expo-constants:preBuild
> Task :react-native-reanimated:assertMinimalReactNativeVersionTask
> Task :react-native-reanimated:assertNewArchitectureEnabledTask SKIPPED
> Task :react-native-reanimated:assertWorkletsVersionTask
> Task :react-native-gesture-handler:generateCodegenSchemaFromJavaScript
> Task :react-native-reanimated:generateCodegenSchemaFromJavaScript
> Task :react-native-gesture-handler:generateCodegenArtifactsFromSchema
> Task :react-native-gesture-handler:preBuild
> Task :react-native-safe-area-context:generateCodegenSchemaFromJavaScript
> Task :react-native-reanimated:generateCodegenArtifactsFromSchema
> Task :react-native-reanimated:prepareReanimatedHeadersForPrefabs
> Task :react-native-reanimated:preBuild
> Task :react-native-safe-area-context:generateCodegenArtifactsFromSchema
> Task :react-native-safe-area-context:preBuild
> Task :react-native-screens:generateCodegenSchemaFromJavaScript
> Task :react-native-svg:generateCodegenSchemaFromJavaScript
> Task :react-native-screens:generateCodegenArtifactsFromSchema
> Task :react-native-screens:preBuild
> Task :react-native-webview:generateCodegenSchemaFromJavaScript
> Task :react-native-svg:generateCodegenArtifactsFromSchema
> Task :react-native-svg:preBuild
> Task :react-native-worklets:assertMinimalReactNativeVersionTask
> Task :react-native-worklets:assertNewArchitectureEnabledTask SKIPPED
> Task :react-native-webview:generateCodegenArtifactsFromSchema
> Task :react-native-webview:preBuild
> Task :react-native-reanimated:preReleaseBuild
> Task :expo:preReleaseBuild
> Task :react-native-worklets:generateCodegenSchemaFromJavaScript
> Task :expo:mergeReleaseJniLibFolders
> Task :expo:mergeReleaseNativeLibs NO-SOURCE
> Task :expo:copyReleaseJniLibsProjectOnly
> Task :expo-constants:preReleaseBuild
> Task :expo-constants:mergeReleaseJniLibFolders
> Task :expo-constants:mergeReleaseNativeLibs NO-SOURCE
> Task :expo-constants:copyReleaseJniLibsProjectOnly
> Task :expo-log-box:preReleaseBuild UP-TO-DATE
> Task :expo-log-box:mergeReleaseJniLibFolders
> Task :expo-log-box:mergeReleaseNativeLibs NO-SOURCE
> Task :expo-log-box:copyReleaseJniLibsProjectOnly
> Task :expo-modules-core:preReleaseBuild UP-TO-DATE
> Task :expo-modules-core:mergeReleaseJniLibFolders
> Task :react-native-async-storage_async-storage:preReleaseBuild
> Task :react-native-worklets:generateCodegenArtifactsFromSchema
> Task :react-native-async-storage_async-storage:mergeReleaseJniLibFolders
> Task :react-native-async-storage_async-storage:mergeReleaseNativeLibs NO-SOURCE
> Task :react-native-async-storage_async-storage:copyReleaseJniLibsProjectOnly
> Task :react-native-gesture-handler:preReleaseBuild
> Task :react-native-gesture-handler:mergeReleaseJniLibFolders
> Task :react-native-reanimated:mergeReleaseJniLibFolders
> Task :react-native-safe-area-context:preReleaseBuild
> Task :react-native-safe-area-context:mergeReleaseJniLibFolders
> Task :react-native-safe-area-context:mergeReleaseNativeLibs NO-SOURCE
> Task :react-native-worklets:prepareWorkletsHeadersForPrefabs
> Task :react-native-worklets:preBuild
> Task :app:preBuild
> Task :app:preReleaseBuild
> Task :react-native-worklets:preReleaseBuild
> Task :react-native-safe-area-context:copyReleaseJniLibsProjectOnly
> Task :app:mergeReleaseJniLibFolders
> Task :react-native-screens:preReleaseBuild

> Task :react-native-worklets:configureCMakeRelWithDebInfo[arm64-v8a]
Checking the license for package CMake 3.22.1 in /usr/local/lib/android/sdk/licenses
License for package CMake 3.22.1 accepted.
Preparing "Install CMake 3.22.1 v.3.22.1".
"Install CMake 3.22.1 v.3.22.1" ready.
Installing CMake 3.22.1 in /usr/local/lib/android/sdk/cmake/3.22.1
"Install CMake 3.22.1 v.3.22.1" complete.
"Install CMake 3.22.1 v.3.22.1" finished.

> Task :react-native-screens:configureCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-screens:buildCMakeRelWithDebInfo[arm64-v8a]
> Task :react-native-screens:configureCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-worklets:buildCMakeRelWithDebInfo[arm64-v8a][worklets]
> Task :react-native-screens:buildCMakeRelWithDebInfo[armeabi-v7a]
> Task :react-native-screens:configureCMakeRelWithDebInfo[x86]
> Task :react-native-screens:buildCMakeRelWithDebInfo[x86]
> Task :react-native-screens:configureCMakeRelWithDebInfo[x86_64]
> Task :react-native-screens:buildCMakeRelWithDebInfo[x86_64]
> Task :react-native-screens:mergeReleaseJniLibFolders
> Task :react-native-screens:mergeReleaseNativeLibs
> Task :react-native-screens:copyReleaseJniLibsProjectOnly
> Task :react-native-svg:preReleaseBuild
> Task :react-native-svg:mergeReleaseJniLibFolders
> Task :react-native-svg:mergeReleaseNativeLibs NO-SOURCE
> Task :react-native-svg:copyReleaseJniLibsProjectOnly
> Task :react-native-webview:preReleaseBuild
> Task :react-native-webview:mergeReleaseJniLibFolders
> Task :react-native-webview:mergeReleaseNativeLibs NO-SOURCE
> Task :react-native-webview:copyReleaseJniLibsProjectOnly
> Task :react-native-gesture-handler:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :react-native-gesture-handler:generateReleaseBuildConfig
> Task :react-native-gesture-handler:generateReleaseResValues
> Task :react-native-gesture-handler:generateReleaseResources
> Task :react-native-gesture-handler:packageReleaseResources
> Task :react-native-gesture-handler:parseReleaseLocalResources
> Task :react-native-gesture-handler:generateReleaseRFile
> Task :react-native-reanimated:generateReleaseBuildConfig
> Task :react-native-reanimated:generateReleaseResValues
> Task :react-native-reanimated:generateReleaseResources
> Task :react-native-reanimated:packageReleaseResources
> Task :react-native-reanimated:parseReleaseLocalResources
> Task :react-native-reanimated:generateReleaseRFile
> Task :react-native-reanimated:javaPreCompileRelease
> Task :react-native-svg:generateReleaseBuildConfig
> Task :react-native-svg:generateReleaseResValues
> Task :react-native-svg:generateReleaseResources
> Task :react-native-svg:packageReleaseResources
> Task :react-native-svg:parseReleaseLocalResources
> Task :react-native-svg:generateReleaseRFile
> Task :react-native-svg:javaPreCompileRelease
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

added 948 packages, and audited 949 packages in 22s

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

PASS integration/staging.test.ts (11.492 s)
  ✓ signed-out visitors can read approved shops and published ads (1336 ms)
  ✓ the countries list is available (243 countries on staging) (191 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (539 ms)
  ✓ signed-out visitors can read the public Wanted columns (513 ms)
  ✓ signed-out visitors cannot create a shop (491 ms)
  ✓ signed-out visitors cannot create a report (493 ms)
  ✓ signed-out visitors cannot use admin functions (369 ms)
  ✓ public trending lists can be read signed out (194 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (193 ms)
  ✓ notifications are private (219 ms)
  ✓ app query: latest finds runs on staging (361 ms)
  ✓ app query: category page with every filter runs on staging (1025 ms)
  ✓ app query: properties for rent and for sale run on staging (368 ms)
  ✓ app query: search runs on staging (192 ms)
  ✓ app query: Explore collections run on staging (741 ms)
  ✓ app query: shop profile lookup and trust run on staging (360 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (508 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (407 ms)
  ✓ profile name check answers yes/no (visitors can run it on staging — see note) (174 ms)
  ✓ app query: Wanted list runs on staging as a visitor (173 ms)

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        11.629 s
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
