# Pi Box Connect - Pi Network deployment notes

This app is prepared as a Pi ecosystem MVP.

## Included
- App name changed to **Pi Box Connect**.
- Login is **Sign in with Pi only**.
- No phone number login, no email login, no manual wallet login, and no demo login.
- Works inside Pi Browser when the official Pi SDK is available.
- Outside Pi Browser, it still renders the app and shows clear guidance when Pi SDK authentication is unavailable.
- Arabic/English language switch with saved user preference.
- Inbox, Sent, Archive, Trash, Contacts, Call Requests, Privacy, and Blocked identities.

## Before production
1. Host the app on HTTPS.
2. Add the hosted domain to your Pi Developer Portal app settings.
3. Verify the Pi access token on a backend before trusting user identity.
4. Replace localStorage MVP persistence with a server database.
5. Add real realtime messaging and WebRTC/signaling if live calls are required.
6. Add privacy policy and terms pages required for public release.

## Important
The frontend can start Pi authentication, but production apps should validate the returned access token on the server before creating sessions or storing user data.
