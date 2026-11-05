# Android test build 31
commit: e3892028ff2077fa5261c2897483c66e9a72f230
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
PASS src/components/__tests__/AuthForm.test.tsx (5.908 s)
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
PASS src/components/__tests__/filters.test.ts (6.85 s)

Test Suites: 15 passed, 15 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        18.87 s
Ran all test suites.
```

## ci-logs/gradle.log (last 120 lines)
```

Welcome to Gradle 9.0.0!

Here are the highlights of this release:
 - Configuration Cache is the recommended execution mode
 - Gradle requires JVM 17 or higher to run
 - Build scripts use Kotlin 2.2 and Groovy 4.0
 - Improved Kotlin DSL script compilation avoidance

For more details see https://docs.gradle.org/9.0.0/release-notes.html

To honour the JVM settings for this build a single-use Daemon process will be forked. For more on this, please refer to https://docs.gradle.org/9.0.0/userguide/gradle_daemon.html#sec:disabling_the_daemon in the Gradle documentation.
Daemon will be stopped at the end of the build 
> Task :gradle-plugin:settings-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :gradle-plugin:shared:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:pluginDescriptors
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:processResources
> Task :gradle-plugin:settings-plugin:pluginDescriptors
> Task :gradle-plugin:settings-plugin:processResources
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:processResources NO-SOURCE
> Task :gradle-plugin:shared:processResources NO-SOURCE
> Task :gradle-plugin:shared:compileKotlin
> Task :gradle-plugin:shared:compileJava NO-SOURCE
> Task :gradle-plugin:shared:classes UP-TO-DATE
> Task :gradle-plugin:shared:jar
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:compileKotlin
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:compileJava NO-SOURCE
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:classes UP-TO-DATE
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:jar
> Task :gradle-plugin:settings-plugin:compileKotlin
> Task :gradle-plugin:settings-plugin:compileJava NO-SOURCE
> Task :gradle-plugin:settings-plugin:classes
> Task :gradle-plugin:settings-plugin:jar
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:compileKotlin
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:compileJava NO-SOURCE
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:classes
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:jar
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

added 959 packages, and audited 960 packages in 21s

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

PASS integration/staging.test.ts (14.265 s)
  ✓ signed-out visitors can read approved shops and published ads (1401 ms)
  ✓ the countries list is available (243 countries on staging) (205 ms)
  ✓ signed-out visitors cannot read a Wanted buyer WhatsApp number (543 ms)
  ✓ signed-out visitors can read the public Wanted columns (506 ms)
  ✓ signed-out visitors cannot create a shop (502 ms)
  ✓ signed-out visitors cannot create a report (174 ms)
  ✓ signed-out visitors cannot use admin functions (691 ms)
  ✓ public trending lists can be read signed out (188 ms)
  ✓ sign-up without the security check is refused (CAPTCHA is on) (203 ms)
  ✓ notifications are private (193 ms)
  ✓ app query: latest finds runs on staging (802 ms)
  ✓ app query: category page with every filter runs on staging (386 ms)
  ✓ app query: properties for rent and for sale run on staging (703 ms)
  ✓ app query: search runs on staging (185 ms)
  ✓ app query: Explore collections run on staging (706 ms)
  ✓ app query: shop profile lookup and trust run on staging (372 ms)
  ✓ signed-out visitors cannot save, block or read other people's saved items (525 ms)
  ✓ signed-out visitors cannot post an ad or upload a photo (1064 ms)
  ✓ profile name check answers yes/no (visitors can run it on staging — see note) (188 ms)
  ✓ app query: Wanted list runs on staging as a visitor (206 ms)
  ✓ app query: Gifts and Trending run on staging as a visitor (1031 ms)
  ✓ reviews: visitors can read them and are told to sign in before reviewing (677 ms)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        14.382 s
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
