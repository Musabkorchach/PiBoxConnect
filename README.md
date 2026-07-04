# Pi Box Connect

Pi Box Connect is a Pi Network communication app concept that uses **Sign in with Pi** and the user's Pi identity / wallet address as the primary communication identity.

## Features

- Sign in with Pi only
- No phone number login
- No email login
- Inbox, sent, archive, trash
- Contacts by Pi identity or wallet address
- Call request interface
- Arabic and English language switching
- Pi Browser compatible UI
- Vercel HTTPS deployment ready

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel environment variables

```env
NEXT_PUBLIC_APP_NAME="Pi Box Connect"
NEXT_PUBLIC_APP_DOMAIN="gdi.pi"
NEXT_PUBLIC_APP_URL="https://gdi.pi"
NEXT_PUBLIC_PI_LOGIN_ONLY="true"
```

## Pi Network production note

The browser app uses the Pi SDK client flow. Before a public production release, add backend verification for the Pi access token and configure the app domain in Pi Developer Portal.
