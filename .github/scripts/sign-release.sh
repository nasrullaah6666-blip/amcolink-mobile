#!/usr/bin/env bash
# Puts the owner's upload key (from GitHub secrets) into the generated Android project and makes the
# release build use it. The key file only exists on the build machine for this run.
set -euo pipefail
printf '%s' "$UPLOAD_KEYSTORE_BASE64" | base64 -d > android/app/upload.jks
cat >> android/app/build.gradle <<'GRADLE'

// Added by .github/scripts/sign-release.sh: sign the release build with the upload key (values from the environment).
android {
    signingConfigs {
        upload {
            storeFile file('upload.jks')
            storePassword System.getenv('UPLOAD_STORE_PASSWORD')
            keyAlias System.getenv('UPLOAD_KEY_ALIAS')
            keyPassword System.getenv('UPLOAD_KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.upload
        }
    }
}
GRADLE
echo "release signing: upload key set"
