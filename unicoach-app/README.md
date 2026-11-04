# UniCoach app

Student app for Android and iOS, built with Expo (React Native) and Expo Router. It uses the same backend and database as unicoach.in.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (Android or iPhone). Press `w` to open it in the browser.

### On your phone with Expo Go

1. Install **Expo Go** from the Play Store or App Store, and keep it updated. Expo Go only runs the newest SDK, and this project is on SDK 58.
2. Connect the phone and the Mac to **the same Wi-Fi**.
3. Run `npx expo start` in this folder.
4. Scan the QR code:
   - **Android:** use the "Scan QR code" button inside Expo Go.
   - **iPhone:** use the normal Camera app, then tap the "Open in Expo Go" banner.
5. Code changes reload on the phone by themselves. Shake the phone to open the dev menu (Reload and similar).

**If the phone can't connect** (office Wi-Fi, a different network or mobile data), use a tunnel instead. It works from any network, but is slower:

```bash
npx expo start --tunnel
```

**"Project is incompatible with this version of Expo Go":** update Expo Go from the store.

## Backend

The default is production: `https://api.unicoach.com/api`. To use a different one, copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL`.

Login uses the same JWT as the website. The app sends it as `Authorization: Bearer <token>` and stores it in the phone's Keychain/Keystore (`expo-secure-store`).

The local backend `.env` points at the live database, so anything you create while testing is real data.

## Layout

- `src/app/` holds the screens (Expo Router):
  - `welcome`, `login`, `register` for logged-out users.
  - `(tabs)/` for logged-in users: Home, Explore, Tools, Chat, My Plan.
- `src/components/ui/` holds the design system pieces: AppText, Button, Card, TextField, Icon/CapMark, Screen.
- `src/theme/tokens.ts` has the Desi Pop v2 colours, fonts and spacing.
- `src/lib/` holds the API client, token storage and auth context.

## Checks

```bash
npx tsc --noEmit
npx eslint src
```
