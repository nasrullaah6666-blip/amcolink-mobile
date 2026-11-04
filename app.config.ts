import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * One app, two identities:
 *  - test builds (development / preview): "Amcolink (staging)", Android ID com.amcolink.app.dev, staging data;
 *  - the store build (EXPO_PUBLIC_APP_ENV=production): "Amcolink", Android ID com.amcolink.app, production data.
 * They can sit side by side on one phone. The data guard in src/lib/config.ts refuses production data in test builds.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const production = process.env.EXPO_PUBLIC_APP_ENV === 'production';
  return {
    ...config,
    name: production ? 'Amcolink' : 'Amcolink (staging)',
    slug: config.slug ?? 'amcolink-mobile',
    android: {
      ...config.android,
      package: production ? 'com.amcolink.app' : 'com.amcolink.app.dev',
      versionCode: Number(process.env.ANDROID_VERSION_CODE ?? 1),
    },
    ios: { ...config.ios, bundleIdentifier: production ? 'com.amcolink.app' : 'com.amcolink.app.dev' },
  };
};
