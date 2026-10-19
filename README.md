# Harvest Online — TASK 01

Mobile-friendly pixel farm multiplayer prototype. GitHub Pages hosts the HTML5 game; Cloudflare Workers + SQLite-backed Durable Objects host a shared WebSocket room.

## Deploy backend (GitHub Codespaces on mobile)
1. Open repository > Code > Codespaces > Create codespace on main (if available).
2. In terminal run `npx wrangler login` and authorize Cloudflare.
3. Run `npx wrangler deploy`. Copy the HTTPS workers.dev URL.
4. Edit `config.js` and replace the placeholder with that URL. Commit.

## Deploy frontend
1. GitHub repo > Settings > Pages > Build and deployment > Deploy from a branch.
2. Choose main and /(root); Save.
3. Open https://harvest-online-lab.github.io/harvest-online/ on two devices.

## Current limits
- Not yet deployed or live-tested.
- No accounts, crops, persistent position, or chat yet.
- Multiplayer requires Cloudflare backend deployment. Durable Objects and Codespaces have usage limits.
- Original pixel shapes, not copyrighted Harvest Moon artwork.
