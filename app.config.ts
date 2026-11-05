import fs from 'node:fs';
import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * One app, two identities:
 *  - test builds (development / preview): "Amcolink (staging)", Android ID com.amcolink.app.dev, staging data;
 *  - the store build (EXPO_PUBLIC_APP_ENV=production): "Amcolink", Android ID com.amcolink.app, production data.
 * They can sit side by side on one phone. The data guard in src/lib/config.ts refuses production data in test builds.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const production = process.env.EXPO_PUBLIC_APP_ENV === 'production';
  // Phone alerts need Firebase settings. CI writes google-services.json from a GitHub secret; without it alerts stay off.
  const googleServices = process.env.GOOGLE_SERVICES_FILE ?? './google-services.json';
  const pushReady = fs.existsSync(googleServices);
  return {
    ...config,
    name: production ? 'Amcolink' : 'Amcolink (staging)',
    slug: config.slug ?? 'amcolink-mobile',
    android: {
      ...config.android,
      package: production ? 'com.amcolink.app' : 'com.amcolink.app.dev',
      versionCode: Number(process.env.ANDROID_VERSION_CODE ?? 1),
      ...(pushReady ? { googleServicesFile: googleServices } : {}),
      // Store app only: amcolink.com links to listings, profiles, categories and Wanted open in the app
      // (Android App Links). Works once the website serves /.well-known/assetlinks.json (docs/APP-LINKS.md).
      ...(production ? {
        intentFilters: [{
          action: 'VIEW',
          autoVerify: true,
          data: ['/ads', '/shops', '/category', '/wanted', '/explore', '/trending', '/gifts']
            .flatMap((pathPrefix) => ['amcolink.com', 'www.amcolink.com'].map((host) => ({ scheme: 'https', host, pathPrefix }))),
          category: ['BROWSABLE', 'DEFAULT'],
        }],
      } : {}),
    },
    extra: { ...config.extra, pushReady },
    ios: { ...config.ios, bundleIdentifier: production ? 'com.amcolink.app' : 'com.amcolink.app.dev' },
  };
};
