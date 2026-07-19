# Pi Box Connect — Authentication Fix

## What changed

- Restored the original visible **Sign in with Pi** button as the only authentication entry point.
- Removed the duplicate automatic authentication wrapper that was starting Pi authentication before the user pressed the button.
- Kept the official Pi SDK flow in `lib/pi-auth.ts`.
- After successful permission and authentication, the page shows **Signed in as @username** and then the working inbox, messages, contacts, calls, and settings tabs.
- Added support for both `walletAddress` and `wallet_address` returned by Pi environments.
- Removed the obsolete `eslint` option from `next.config.mjs`.

## Verification

`npm run build` completed successfully with Next.js 15.2.4.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/pi`.

For real Pi authentication, open the deployed HTTPS URL inside Pi Browser and make sure the domain is configured in Pi Developer Portal.
