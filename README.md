# Ammar Amir — Chapter 23

A birthday experience for Ammar Amir, made for 26 November 2026. The page contains the royal doors, birthday portrait, age reveal, cousin’s letter, four mystery gifts, interactive cake, and finale.

## Run locally

Use Node.js 22 or 24 and npm. From this directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the local URL printed by Next.js. To preview the production build, run `npm.cmd run build` and then `npm.cmd start`.

## Verify

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
$env:BIRTHDAY_URL = 'http://localhost:3000'
node scripts/browser-qa.mjs
```

The mystery gift suite checks the opening, audio cue scheduling, revisit, progress, cake, and replay in installed Chrome. To run it against Playwright’s WebKit port, run `npx.cmd playwright install webkit`, set `$env:BIRTHDAY_ENGINE = 'webkit'` and repeat the test. Screenshots go into `artifacts/<engine>/`. WebKit automation exercises the rendering engine. An iPhone running Safari is required to measure hardware frame rates and verify real-device audio output, browser chrome, and the native share sheet.

## Deploy to Vercel

1. Create a Git repository for this directory and push it to a Git provider connected to Vercel.
2. In Vercel select **Add New → Project**, import the repository, and keep the **Next.js** framework preset. Use the repository root and the default install and build commands. No environment variables are required. See the [Vercel Git deployment guide](https://vercel.com/docs/git).
3. Deploy, open the HTTPS URL on your phone, and use **Share Birthday Website** to share the final link. The page requests search-engine exclusion. Anyone with a reachable deployment link can open the experience.

Keep `image.png` as the source portrait. The page serves three WebP sizes and uses the uncropped image in both compositions. To rebuild the prepared assets, run `node scripts/prepare-assets.mjs`.

Music and sound effects are synthesized in app/audio.ts. Replay resets the gifts and preserves the mute preference.

The four gift products in `public/assets/gift-*.webp` are custom generated product images with transparent backgrounds. The boxes use textured CSS surfaces animated with GSAP.
