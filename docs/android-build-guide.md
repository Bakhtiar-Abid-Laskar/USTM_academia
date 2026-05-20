# Android Build Guide — USTM Academia

> Convert the USTM Academia PWA into an Android APK/AAB using Trusted Web Activity (TWA).

## Prerequisites

- Node.js 18+ installed
- Java JDK 11+ installed
- Android SDK installed (or Android Studio)
- The website deployed on HTTPS (e.g., `https://ustm-academia.vercel.app`)
- PWA manifest and service worker working
- App icons generated (see below)

---

## Step 0: Generate App Icons

Before building the APK, you need to create the required icon files.

### Required Icons

| File | Size | Notes |
|------|------|-------|
| `public/icons/icon-72.png` | 72×72 | Small launcher icon |
| `public/icons/icon-96.png` | 96×96 | Medium launcher icon |
| `public/icons/icon-128.png` | 128×128 | Standard icon |
| `public/icons/icon-144.png` | 144×144 | Standard icon |
| `public/icons/icon-152.png` | 152×152 | Apple touch icon size |
| `public/icons/icon-192.png` | 192×192 | **Required** for PWA |
| `public/icons/icon-384.png` | 384×384 | Large icon |
| `public/icons/icon-512.png` | 512×512 | **Required** for PWA |
| `public/icons/maskable-512.png` | 512×512 | **Required** – maskable icon with safe zone padding |

### How to Generate

1. **Source**: Use your `public/ustm-logo.png` as the base image.
2. **Tool**: Use [maskable.app](https://maskable.app/editor) to create the maskable icon.
3. **Tool**: Use [realfavicongenerator.net](https://realfavicongenerator.net) or [pwa-asset-generator](https://github.com/nicedoc/pwa-asset-generator) to generate all sizes:

```bash
npx pwa-asset-generator public/ustm-logo.png public/icons --icon-only --favicon
```

### Maskable Icon Guidelines

The maskable icon must have content within the "safe zone" (center 80% circle). Place the logo with generous padding around it so it doesn't get clipped on different Android devices.

---

## Step 1: Deploy the Website

Make sure your website is deployed and accessible on HTTPS:

```bash
# Build and deploy to Vercel
npm run build
vercel --prod
```

Verify these URLs work:
- `https://ustm-academia.vercel.app/manifest.json`
- `https://ustm-academia.vercel.app/sw.js`
- `https://ustm-academia.vercel.app/.well-known/assetlinks.json`

---

## Method A: Bubblewrap (Full Control)

### Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### Initialize Android Project

```bash
mkdir ustm-android && cd ustm-android

bubblewrap init --manifest=https://ustm-academia.vercel.app/manifest.json
```

During initialization, Bubblewrap will ask you:
- **Package name**: `com.ustmacademia.twa`
- **App name**: `USTM Academia`
- **Launcher name**: `Academia`
- **Display mode**: `standalone`
- **Theme color**: `#0f172a`
- **Background color**: `#f8fafc`

It will also download the Android SDK and JDK if needed.

### Build the APK

```bash
bubblewrap build
```

This produces:
- `app-release-signed.apk` — for testing
- `app-release-bundle.aab` — for Play Store

### Test on Android Device

```bash
# Connect device via USB with USB debugging enabled
adb install app-release-signed.apk
```

### Get the SHA256 Fingerprint

After building, Bubblewrap will show your signing key fingerprint. Copy the SHA256 value and update your `public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ustmacademia.twa",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:..."
      ]
    }
  }
]
```

> **IMPORTANT**: After updating `assetlinks.json`, redeploy the website. The TWA will show a browser bar until Digital Asset Links verification passes.

---

## Method B: PWABuilder (Easier)

1. Deploy your website to production
2. Visit [PWABuilder.com](https://www.pwabuilder.com)
3. Enter your production URL: `https://ustm-academia.vercel.app`
4. PWABuilder will analyze your PWA and show a score
5. Fix any issues it identifies
6. Click **"Package for stores"** → **"Android"**
7. Choose **"Google Play"** (uses TWA)
8. Fill in the package name: `com.ustmacademia.twa`
9. Download the generated APK/AAB
10. PWABuilder will also give you the signing key fingerprint
11. Update `assetlinks.json` with the fingerprint
12. Redeploy the website
13. Test the APK on an Android device

> PWABuilder is easier but gives less control. Bubblewrap is better for customization.

---

## Digital Asset Links Verification

For the TWA to open full-screen (without browser bar), you must:

1. Serve `/.well-known/assetlinks.json` at your domain
2. The `package_name` must match your Android app
3. The `sha256_cert_fingerprints` must match your signing key
4. The file must return `Content-Type: application/json`

### Verify It Works

```bash
# Check the file is accessible
curl https://ustm-academia.vercel.app/.well-known/assetlinks.json

# Use Google's verification tool
# https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://ustm-academia.vercel.app&relation=delegate_permission/common.handle_all_urls
```

---

## Play Store Upload

1. Create a [Google Play Developer account](https://play.google.com/console) ($25 one-time fee)
2. Create a new app in the Play Console
3. Upload the `.aab` file (not `.apk`)
4. Fill in store listing details
5. Add screenshots (see `manifest.json` screenshots section)
6. Submit for review

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Browser bar showing in TWA | `assetlinks.json` fingerprint doesn't match. Redeploy after updating. |
| App crashes on launch | Check that the website URL is accessible and HTTPS |
| Service worker not registering | Check browser console for errors. Ensure `/sw.js` is accessible. |
| Manifest not detected | Verify `https://yourdomain.com/manifest.json` returns valid JSON |
| Icons not showing | Ensure all icon files exist at the paths specified in `manifest.json` |
