# AI Agent Cloudflare Deployment

Use this runbook when a user asks an AI agent to deploy EdgeEver from a GitHub repository to Cloudflare.

## Rules

- Use local deployment only for the first installation or emergency recovery. Connect Cloudflare Workers Builds after the first deployment.
- Keep account IDs, resource names, API tokens, domains, and passwords in the git-ignored `.env.local`; never hard-code or commit them.
- Prefer the repository's deployment scripts. Ask the user only for authorization, domain ownership, or other information that cannot be inferred safely.
- Do not configure a separate GitHub Actions deployment for the Worker.

## Runbook

1. Prepare the repository:

   ```sh
   git clone <repo-url>
   cd edgeever
   bun install
   ```

2. Verify Cloudflare access:

   ```sh
   bunx wrangler whoami
   ```

   If authentication fails and cannot be completed in the browser, ask the user to authorize Cloudflare before continuing.

3. Initialize the deployment. Use the default first login (`admin` / `admin123`):

   ```sh
   bun run deploy:setup
   ```

   If the user supplied another password, run this instead:

   ```sh
   EDGE_EVER_PASSWORD='<first-login-password>' bun run deploy:setup
   ```

   Then check and deploy:

   ```sh
   bun run deploy:doctor
   bun run deploy
   ```

   Fix every `deploy:doctor` failure before deploying.

4. Verify the URL reported by Wrangler:

   ```sh
   curl -I https://<worker-url>/
   curl https://<worker-url>/api/openapi.json
   ```

   Open the site and confirm that login succeeds.

5. Enable automatic updates:

   ```sh
   bun run deploy:builds:setup
   ```

   Follow [Cloudflare Workers Builds](cloudflare-workers-builds.md) only when the command requests authorization or an API token.

## Stop and Ask the User

Stop only when Cloudflare authorization cannot be completed, a requested custom domain is unavailable, or account permissions, limits, billing, or an unresolvable resource-name conflict prevents deployment.

## Final Response

Report the deployed URL, initial login, Workers Builds status, and any remaining user action. Confirm that future pushes to `main` automatically deploy the instance.
