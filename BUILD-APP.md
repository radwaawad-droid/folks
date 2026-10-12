# Building the folks mobile app (Capacitor)

folks is wrapped into native iOS and Android apps with **Capacitor**. The app loads
the live site (folks-pearl.vercel.app), so updates you push to the website show up in
the app automatically — no rebuild needed for content changes.

You only rebuild the app when you change native things (icon, splash, push, plugins)
or want to ship a new store version.

---

## One-time setup (on your Mac)

1. Install the tools if you don't have them:
   - **Xcode** — from the Mac App Store (big download).
   - **Node.js** — from nodejs.org (LTS version).
   - **CocoaPods** — in Terminal: `sudo gem install cocoapods`

2. Get the project onto your Mac:
   ```
   git clone https://github.com/radwaawad-droid/folks.git
   cd folks
   npm install
   ```

3. Add the native platforms:
   ```
   npx cap add ios
   npx cap add android
   ```

4. Sync and open:
   ```
   npx cap sync
   npx cap open ios        # opens the project in Xcode
   ```

---

## Building for the App Store (iOS)

1. In Xcode, select the **App** target → **Signing & Capabilities**.
2. Sign in with your Apple Developer account and pick your **Team**.
3. Confirm the **Bundle Identifier** is `ae.folks.app` (must be unique in your account).
4. Choose **Any iOS Device** as the run target.
5. Menu: **Product → Archive**.
6. When the Organizer opens: **Distribute App → App Store Connect → Upload**.
7. Finish the listing in App Store Connect (name: *folks: a closer community*,
   screenshots, description, privacy policy URL `/privacy`, demo login for the reviewer).

## Building for Google Play (Android)

Either open the Android project with `npx cap open android` and build a signed
**App Bundle (.aab)** in Android Studio, **or** use the simpler PWABuilder route
(pwabuilder.com → your URL → Package for stores → Android).

---

## Updating later

- **Changed the website?** Nothing to do — the app loads it live.
- **Changed native config, icon, splash, or push?** Run `npx cap sync`, then re-archive
  and upload a new version.

> Note: the `/ios` and `/android` folders are generated on your Mac and are gitignored,
> so they stay on your machine and don't clutter the repo.
