# Opening amcolink.com links in the app (Android App Links)

The store app ("Amcolink", `com.amcolink.app`) already declares that it opens these amcolink.com links:
`/ads/…`, `/shops/…`, `/category/…`, `/wanted…`, `/explore`, `/trending`, `/gifts` (app.config.ts, store build only).
Android only does it after checking a small file on the website. Until that file exists, links simply open the browser.

## The website file (needs your "go" and "deploy" — website change)
`public/.well-known/assetlinks.json` in the website repo, served at https://amcolink.com/.well-known/assetlinks.json:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.amcolink.app",
    "sha256_cert_fingerprints": ["<PLAY APP SIGNING SHA-256>"]
  }
}]
```

The fingerprint is known only after the first upload to Google Play: Play Console → your app → Test and release →
App integrity → App signing → "SHA-256 certificate fingerprint" (the **app signing key**, not the upload key).
It is public (not a secret). Send it in chat or tell me and I'll prepare the website change for your deploy.
Cloudflare: make sure the file is not cached with an old version (purge after deploy).
