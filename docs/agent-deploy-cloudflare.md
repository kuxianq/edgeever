# AI Agent Cloudflare Deployment

This document is the deployment contract for AI agents. If a user asks an agent to deploy EdgeEver from a GitHub URL to Cloudflare, follow this runbook before asking the user for anything.

## One Prompt Install

Users should be able to start with only this prompt:

```text
This is the GitHub project URL: <repo-url>. Install and deploy this project to Cloudflare for me.
```

Chinese version:

```text
这个是 GitHub 上的项目链接：<repo-url>。请把这个项目安装部署到 Cloudflare 上。
```

## Agent Rules

- Read `AGENTS.md`, `README.md`, `.env.local.example`, and this file first.
- Do not create a new Git branch. Work on `main`.
- Treat deployment as two required phases: use `bun run deploy:setup`, `bun run deploy:doctor`, and `bun run deploy` only for the initial installation; then run `bun run deploy:builds:setup` so all routine updates use Cloudflare Workers Builds.
- Do not hard-code a personal Worker name, D1 database ID, R2 bucket name, account ID, API token, or domain in source files.
- Use `.env.local` for local/private deployment values. It is git-ignored.
- If the Cloudflare MCP or Cloudflare plugin is available, it may be used to inspect or create resources. If not, use Wrangler through the scripts in this repo.
- Ask the user only for values that cannot be inferred or generated safely, such as Cloudflare authorization, the first login password, or custom domain ownership.

## Required Tools

- Bun
- Wrangler, installed by `bun install` as a project dev dependency
- A Cloudflare account authorized by either `wrangler login` or `CLOUDFLARE_API_TOKEN`

## Standard Flow

1. Clone the repository and enter it.

   ```sh
   git clone <repo-url>
   cd edgeever
   ```

2. Install dependencies.

   ```sh
   bun install
   ```

3. Ensure Cloudflare authentication.

   ```sh
   bunx wrangler whoami
   ```

   If this fails, ask the user to finish Cloudflare login or provide a suitable API token. Do not continue deployment until this works.

4. Prepare deployment resources and `.env.local`.

   `EDGE_EVER_PASSWORD` must contain the **plaintext password that the user will type when first logging in to EdgeEver**. It is not an encrypted password or a password hash. If the user gave this first login password, run:

   ```sh
   # Plaintext first-login password; do not put a hash here.
   EDGE_EVER_PASSWORD='<first-login-password>' bun run deploy:setup
   ```

   If no password was provided, ask for one or ask permission to generate a random password. Then rerun the command with `EDGE_EVER_PASSWORD`.

   `deploy:setup` will:

   - copy `.env.local.example` to `.env.local` when needed
   - reuse or create the D1 database
   - create the R2 buckets when needed
   - save the plaintext `EDGE_EVER_PASSWORD` as `EDGE_EVER_AUTH_PASSWORD` in the private, git-ignored `.env.local`; deployment uploads it as a Cloudflare Worker Secret, not a regular plaintext build variable

   Password variable meanings:

   - `EDGE_EVER_PASSWORD`: plaintext first-login password passed temporarily to `deploy:setup`
   - `EDGE_EVER_AUTH_PASSWORD`: the same plaintext login password stored only in private `.env.local` and uploaded as a Cloudflare Worker Secret
   - `EDGE_EVER_AUTH_PASSWORD_HASH`: a PBKDF2 password hash supported only for legacy or advanced configurations; never pass this hash through `EDGE_EVER_PASSWORD`

5. Check the deployment inputs.

   ```sh
   bun run deploy:doctor
   ```

   Fix every `fail` result before deploying.

6. Deploy.

   ```sh
   bun run deploy
   ```

   `bun run deploy` builds the web app, applies remote D1 migrations, and deploys the Worker. During deploy, `scripts/run-wrangler.mjs` uploads `EDGE_EVER_AUTH_PASSWORD` as a Worker Secret via a generated `.env.wrangler.generated*.secrets` file, then synchronizes it again with `wrangler secret put` after a successful deployment so the first login does not depend on the bulk secrets upload alone. Existing `EDGE_EVER_AUTH_PASSWORD_HASH` configurations remain supported and take precedence when both Secrets exist.

7. Verify the result.

   Use the Worker URL from Wrangler output, then check:

   ```sh
   curl -I https://<worker-url>/
   curl https://<worker-url>/api/openapi.json
   ```

   Open the site, log in with `EDGE_EVER_AUTH_USERNAME` and the first login password, then create an MCP token from the in-app MCP settings.

8. Connect Cloudflare Workers Builds.

   Prefer the automated setup command:

   ```sh
   bun run deploy:builds:setup
   ```

   It reads the fork remote and `.env.local`, then creates or updates the Cloudflare repository connection, production trigger, build commands, cache, watch paths, and build variables. The configuration API requires a **User API Token** (`My Profile` -> `API Tokens`), not an Account API Token; it must have `Workers Builds Configuration: Edit` and `Workers Scripts: Read`, and be set as `EDGE_EVER_BUILDS_API_TOKEN`. The agent should complete the Cloudflare GitHub App authorization in the browser when available. If Cloudflare requires a build-token choice, use the exact Dashboard path and retry command shown in [Cloudflare Workers Builds](cloudflare-workers-builds.md).

   Once connected, a GitHub **Sync fork** push automatically migrates and deploys the user's own instance. Do not configure the repository's GitHub Actions Worker deployment for this purpose.

## Optional Customization

Set these values in `.env.local` before `bun run deploy:setup` or `bun run deploy`:

```sh
EDGE_EVER_WORKER_NAME=edgeever
EDGE_EVER_D1_DATABASE_NAME=edgeever
EDGE_EVER_R2_BUCKET_NAME=edgeever-resources
EDGE_EVER_R2_PREVIEW_BUCKET_NAME=edgeever-resources-preview
EDGE_EVER_AUTH_USERNAME=admin
EDGE_EVER_AUTH_PASSWORD=<login-password>
EDGE_EVER_SESSION_TTL_DAYS=400
EDGE_EVER_CUSTOM_DOMAIN=notes.example.com
```

For multiple instances, set `EDGE_EVER_INSTANCE=<name>` and use scoped variables such as:

```sh
EDGE_EVER_PROD_WORKER_NAME=edgeever-prod
EDGE_EVER_PROD_D1_DATABASE_ID=<database-id>
EDGE_EVER_PROD_R2_BUCKET_NAME=edgeever-prod-resources
EDGE_EVER_PROD_AUTH_PASSWORD=<login-password>
```

Legacy or advanced installations may use `EDGE_EVER_<INSTANCE>_AUTH_PASSWORD_HASH` instead. Never place either password value in a committed file or a non-secret Cloudflare variable.

## Blocking Conditions

Stop and ask the user only when:

- Cloudflare authentication is missing and the agent cannot open or complete login.
- The user must choose or provide the first login password.
- The requested custom domain is not available in the Cloudflare account.
- Resource creation fails because of account limits, permissions, billing, or conflicting names that cannot be resolved by choosing a new name.

## Final User Response

After deployment, report:

- deployed URL
- login username
- whether the password was user-provided or generated
- where to create the EdgeEver MCP token in the app
- confirmation that Workers Builds is connected and that future `main` pushes automatically migrate and deploy
- any custom domain or Cloudflare DNS step that remains
