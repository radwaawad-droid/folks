# folks — web app (Next.js + Supabase)

Neighbourhood sharing for Arabian Ranches. Username + password auth (no phone).

## Run locally
Needs Node.js 18+:
```bash
npm install
npm run dev
```
Open http://localhost:3000. Supabase URL + key are already in `.env.local`.

## One-time Supabase setup

1. **Run the SQL** in `ADD_USERNAME.sql` (SQL Editor → paste → Run).
   It adds the `username` column and the needed read/write policies.

2. **Email auth + no confirmation** (we map usernames to internal emails):
   - Authentication → Sign In / Providers → make sure **Email** is enabled.
   - Authentication → Providers → Email → turn **OFF "Confirm email"**
     (so sign-up logs people in immediately — there's no real inbox to confirm).

3. **Storage for photos (optional)** — create public buckets `item-photos` and
   `avatars`, then:
   ```sql
   create policy "folks upload item photos" on storage.objects
     for insert to authenticated with check (bucket_id = 'item-photos');
   create policy "folks upload avatars" on storage.objects
     for insert to authenticated with check (bucket_id = 'avatars');
   ```

## The flow
1. **/** — welcome page: what folks is + Sign up / Sign in tabs.
   - Sign up: full name, community, username, password → account created → /browse
   - Sign in: username + password (existing users only) → /browse
2. **/browse** — all live listings + “＋ List an item”.
3. **/list** — add a listing (title, category, description, free/fee, optional photo).
4. **/item/[id]** — item detail + request to borrow.
5. **/profile** — your listings, your borrows, incoming requests (accept/decline), sign out.

## Not built yet
In-app chat, pickup/return confirmation, reviews, search/filter.

## In-app chat (new)
- Inbox at **/messages**, a conversation per booking at **/messages/[id]**.
- "Message" buttons appear on your borrows and on incoming requests in /profile.
- Chat works out of the box (it polls every few seconds). For instant delivery,
  enable Realtime on the messages table: Supabase → Database → Replication →
  add `public.messages` to the `supabase_realtime` publication. Optional.

## Installable app (PWA) — added

folks is now an installable Progressive Web App:
- `public/manifest.webmanifest` — app name, folks icon, green theme, opens standalone
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-icon.png` — home-screen icons
- `public/sw.js` + `components/PWARegister.js` — service worker (install + offline shell)

### To make it a real installable app
1. **Deploy** this project (see below). PWA install only works over https, which Vercel gives you.
2. On a phone, open your live URL in the browser:
   - **iPhone (Safari):** Share → *Add to Home Screen*
   - **Android (Chrome):** menu ⋮ → *Install app* / *Add to Home screen*
3. It installs with the folks icon and opens full-screen, no browser bars.

### Deploy to Vercel (free)
1. Put this folder on GitHub (new repo → upload).
2. Go to vercel.com → New Project → import the repo.
3. Add two Environment Variables (from Supabase → Project Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy → you get a live https URL (e.g. folks.vercel.app).
5. In Supabase → Authentication → URL Configuration, add that URL to the allowed/site URLs.
