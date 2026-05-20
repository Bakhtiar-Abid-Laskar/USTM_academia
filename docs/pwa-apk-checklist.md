# PWA to Android APK Checklist

Use this checklist to ensure everything is ready before generating the APK.

---

## Website Deployment

- [ ] Website deployed on HTTPS
- [ ] Production domain working (`https://ustm-academia.vercel.app`)
- [ ] All public routes working (Home, Courses, Search, About, Help)
- [ ] Supabase Auth working (admin login/logout)
- [ ] Admin dashboard accessible
- [ ] Google Drive uploads working
- [ ] PDF viewer working on desktop
- [ ] PDF viewer working on mobile
- [ ] Mobile responsive layout verified on all pages

---

## PWA Requirements

- [ ] `public/manifest.json` exists and is valid JSON
- [ ] `manifest.json` has `name`, `short_name`, `start_url`, `display`
- [ ] `manifest.json` has `theme_color` and `background_color`
- [ ] `manifest.json` linked in `<head>` via Next.js metadata
- [ ] App icon `icon-192.png` exists in `public/icons/`
- [ ] App icon `icon-512.png` exists in `public/icons/`
- [ ] Maskable icon `maskable-512.png` exists in `public/icons/`
- [ ] Service worker `sw.js` exists in `public/`
- [ ] Service worker registered via `ServiceWorkerRegister.tsx`
- [ ] Service worker does NOT cache `/api/*` routes
- [ ] Service worker does NOT cache Supabase auth responses
- [ ] Service worker does NOT cache Google Drive API responses
- [ ] Service worker does NOT cache admin pages
- [ ] Offline fallback page `offline.html` exists
- [ ] App is installable via Chrome "Add to Home Screen"

---

## PWA Testing

- [ ] Chrome DevTools → **Application** → **Manifest** shows valid manifest
- [ ] Chrome DevTools → **Application** → **Service Workers** shows registered SW
- [ ] Chrome DevTools → **Lighthouse** → **PWA** score is good
- [ ] Android Chrome → Can "Add to Home Screen"
- [ ] Standalone mode opens without browser UI

---

## Supabase Auth Compatibility

- [ ] Supabase Dashboard → **Site URL** set to `https://ustm-academia.vercel.app`
- [ ] Supabase Dashboard → **Redirect URLs** includes `https://ustm-academia.vercel.app/**`
- [ ] No `localhost` URLs in production Supabase config
- [ ] Admin login works in standalone/PWA mode
- [ ] Admin logout works correctly
- [ ] Session persists across app restarts
- [ ] Protected admin routes redirect to login correctly

---

## Google Drive Compatibility

- [ ] Google Drive API credentials are server-side only (no `NEXT_PUBLIC_GOOGLE_*`)
- [ ] Upload form works
- [ ] File upload API route works
- [ ] PDF preview links load correctly
- [ ] PDF download links work
- [ ] PDF viewer works on mobile in standalone mode

---

## Android TWA

- [ ] Bubblewrap or PWABuilder installed
- [ ] Android package initialized with `com.ustmacademia.twa`
- [ ] Signing key generated
- [ ] SHA256 fingerprint copied from signing key
- [ ] `public/.well-known/assetlinks.json` updated with correct fingerprint
- [ ] `assetlinks.json` deployed and accessible at production URL
- [ ] `assetlinks.json` returns `Content-Type: application/json`
- [ ] TWA opens full-screen without browser bar
- [ ] APK tested on physical Android device
- [ ] AAB generated for Play Store upload

---

## Environment Variables

- [ ] All `NEXT_PUBLIC_*` vars are safe for client exposure
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] `GOOGLE_CLIENT_SECRET` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] `GOOGLE_PRIVATE_KEY` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] `GOOGLE_REFRESH_TOKEN` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] `.env.local` is in `.gitignore`
- [ ] `.google-credentials.json` is in `.gitignore`

---

## Testing Checklist (Post-APK Install)

- [ ] App icon appears on Android home screen
- [ ] App opens full-screen (no browser bar)
- [ ] Home page loads correctly
- [ ] Search page works (Algolia)
- [ ] Course browsing works
- [ ] PDF viewer works inside the app
- [ ] "Open in Browser" fallback works for PDFs
- [ ] Admin login works
- [ ] Admin document upload works
- [ ] Back button behavior is correct
- [ ] No horizontal scrolling on any page
- [ ] All modals/dialogs fit mobile screen
