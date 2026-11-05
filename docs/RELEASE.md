# Releasing the store app (Google Play)

The store app is "Amcolink" (`com.amcolink.app`) and uses the **production** database. It is built only when you
start it: GitHub → amcolink-mobile → **Actions** → **Android release build (Google Play)** → **Run workflow**.
The build stops with a list of missing settings until all of the ones below exist. You never paste any of them in chat.

## 1. Settings in GitHub (amcolink-mobile → Settings → Secrets and variables → Actions)

| Name | Where it goes | What it is | Where you get it |
|---|---|---|---|
| `PROD_SUPABASE_KEY` | Secrets | The **publishable** key of the production project (starts `sb_publishable_`). Never the secret / service_role key — the build refuses those. | Supabase → production project `mjqhfqylarqgtqdfjsen` → Project Settings → API Keys |
| `PROD_TURNSTILE_SITE_KEY` | Secrets | The **site key** (public) of the production Turnstile widget | Cloudflare → Turnstile → the production widget |
| `PROD_CAPTCHA_PAGE` | **Variables** tab | Address of the permanent security-check page for the app (owner list item: permanent page; its hostname added to the production widget) | Your Cloudflare page |
| `ANDROID_UPLOAD_KEYSTORE_BASE64` | Secrets | Your upload key file, turned into text (step 2) | You create it |
| `ANDROID_UPLOAD_STORE_PASSWORD` | Secrets | The key file's password | You choose it |
| `ANDROID_UPLOAD_KEY_ALIAS` | Secrets | The key's name, e.g. `amcolink-upload` | You choose it |
| `ANDROID_UPLOAD_KEY_PASSWORD` | Secrets | The key's password (can be the same as the file's) | You choose it |

The Firebase file is already there (`GOOGLE_SERVICES`).

## 2. Create the upload key (once, on your laptop)

Google keeps the real app-signing key ("Play App Signing"); you keep only an **upload key**. Losing it is fixable
through Google support, but keep a backup anyway (a USB stick or a password manager).

1. Install Android Studio (it includes `keytool`), or any Java.
2. In a terminal:
   `keytool -genkeypair -v -keystore amcolink-upload.jks -alias amcolink-upload -keyalg RSA -keysize 2048 -validity 10000`
   Answer the questions (your name / Amcolink / country). Choose a strong password and write it down.
3. Turn the file into text: on Windows PowerShell
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes("amcolink-upload.jks")) | Set-Clipboard`
   (on Mac: `base64 -i amcolink-upload.jks | pbcopy`) — then paste it as `ANDROID_UPLOAD_KEYSTORE_BASE64`.

## 3. Build and upload

1. Actions → **Android release build (Google Play)** → **Run workflow**. About 45 minutes.
2. Open the finished run → **Artifacts** → download `amcolink-play-N` (a zip with `app-release.aab`).
3. Google Play Console → your app → **Testing → Internal testing** (or Closed) → Create release → upload the `.aab`.
   On the first upload, accept **Play App Signing**.
4. Version: the number shown on the phone is from `app.json` ("1.0.0"); the store's version code is the run number.

## Before the first upload (checked by Claude, decided by you)
- Production: phone alerts and Wanted alerts set up (owner task 3), so the store app's alerts work.
- Store listing and Data safety answers: `docs/STORE-LISTING.md`.
