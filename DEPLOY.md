# Deploy checklist
GitHub Pages: Repository Settings > Pages > Source: GitHub Actions. The pages.yml workflow publishes static game files.

Cloudflare Worker: First-time Cloudflare account authorization is required. In GitHub repository Settings > Secrets and variables > Actions add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID. Never commit credentials. The cloudflare.yml workflow runs Wrangler 4 and deploys the Durable Object binding.

After successful Worker deploy, update config.js to the Worker HTTPS URL. Test /health and two independent browsers in room farm1. Until Worker deploy and URL configuration, multiplayer is not online.
