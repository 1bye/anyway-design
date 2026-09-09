# Anyway MD

A personal setup builder for agent skills and `AGENTS.md`, built with TanStack Start, React 19, Tailwind CSS 4, and Cloudflare D1. The interface follows the repository's `design.md`: a gray canvas, white cards, pill controls, and self-hosted Geist fonts.

## Run locally

From the repository root:

```sh
bun install
bun run --cwd apps/md db:local
bun run dev:md
```

Open <http://127.0.0.1:3002>. Local D1 state is stored in `apps/md/.wrangler`, and persists across restarts. Cloudflare credentials and Turnstile are unnecessary for this local workflow. The all-zero database ID in `wrangler.jsonc` is a local placeholder; production resources are managed by Alchemy.

## Included in the MVP

- Search and filter 14 curated skills from Vercel, Anthropic, and Superpowers. Inspect the actual `SKILL.md` and open its pinned GitHub source.
- Choose coding rules, testing style, collaboration style, test commands, and custom Markdown. Preview or download the resulting `AGENTS.md`.
- Target Codex, Claude Code, Cursor, or the universal `.agents/skills` directory. Claude Code also gets a `CLAUDE.md` file importing `AGENTS.md`.
- Keep a local draft, import/export preset JSON, and save up to five setups without creating an account.
- Restore a library with a private recovery key. Recovery rotates the browser session; generating a new recovery key invalidates the previous key.
- Open an unlisted link to view, install, or copy a setup. Only its owner can update/delete it. Editing an owned setup updates the same link.
- Install the complete skill folders, supporting files, upstream license notices, generated instructions, and a `.anyway-md.json` manifest.

The catalog and rule library are curated, not a mirror of all available skills. The installer copies skill files; it does not install their optional runtime dependencies, MCP servers, or run their scripts.

## The second command

Save a setup and copy the command shown in the builder. For example:

```sh
npx --yes https://md.anyway.design/cli.tgz https://md.anyway.design/p/<preset-id>
```

Run it inside a freshly created project. Node.js 22+ and Git are required. The host is derived from the current deployment, so the same workflow works against localhost. The package is served by the app; no npm publication is required.

- `--dry-run` lists intended paths without modifying the project.
- Existing identical files are left alone. Differing files stop the entire install before project files are changed.
- `--force` moves differing files into `.anyway-md/backups/<timestamp>/` before replacing them. Installation failures roll back replaced paths.
- Symbolic-link destinations, source traversal, unpinned revisions, oversized skill folders, and special files are rejected.
- Saved setups snapshot the exact Markdown and skill commit hashes. Catalog refreshes affect new saves, not existing installations. Updating a saved setup deliberately updates its snapshot.
- Switching agents or removing a selected skill does not delete previously installed skill folders. Remove obsolete folders explicitly if necessary.

JSON export preserves your selections and custom rules; reimporting and saving resolves them against the currently shipped catalog. Keep the install manifest when you need the exact previously installed revisions.

## Anonymous storage

An unpredictable `HttpOnly`, `Secure`, `SameSite=Strict` cookie identifies the library in production. Session and recovery secrets are stored as SHA-256 hashes. There is no fingerprinting. Anyone with a share link can read its setup; the link cannot edit it. Do not put credentials in shared instructions.

D1 triggers enforce five setups and 1 MB **total serialized storage per library**, including saved Markdown and skill metadata. Writes require the exact origin. D1 rate limits cap writes, library creation, and recovery attempts; expired rate-limit records are pruned. Production library creation additionally requires server-verified Turnstile. There is also a conservative ceiling of 1,000 new libraries per rolling day. This is an MVP abuse budget, not a claim of unlimited free hosting.

Clearing browser data loses the session. The recovery key or a preset export is the portable backup. Without the session or key, editing access cannot be recovered. Recovery supports one active browser session per library.

## Deploy with the existing infrastructure

`packages/infra/alchemy.run.ts` now declares the MD worker and its D1 database alongside the existing web worker. Alchemy applies the SQL migrations. The infra deploy script packages the CLI before building, and the CLI workspace is included in Alchemy's build hash.

1. Configure Cloudflare access using the repository's existing Alchemy workflow.
2. Copy `apps/md/.env.example` to `apps/md/.env`. Create a Cloudflare Turnstile widget for the intended hostname, then set its site key and secret. Secrets stay in server bindings.
3. Set `MD_DOMAIN=md.anyway.design` to attach that custom domain, with `anyway.design` in the same Cloudflare account. Omit it to use the generated workers.dev URL; add that hostname to Turnstile instead.
4. Deploy the stack from `packages/infra`:

```sh
bun run deploy --stage production
```

This deploys both apps in the existing stack. It does not require R2. Without Turnstile configuration, production cloud saves fail closed and local exports remain usable. Development's verification bypass only applies to loopback hostnames; setting `APP_ENV=development` on a public host does not enable it.

No production resources or DNS records are created by local development or the build command.

## Maintain and verify

```sh
bun run test:md
bun run --cwd apps/md check-types
bun run build:md
bun x ultracite check apps/md packages/md-cli packages/infra/alchemy.run.ts
```

Tests run production API queries against in-memory SQLite with the real migration constraints. They cover ownership, snapshot stability, recovery, rate limits, cross-origin writes, storage quotas, and installer conflict/rollback behavior. Browser and actual `npx`/Git checks complement these tests.

To resolve fresh catalog revisions and validate every source `SKILL.md`:

```sh
bun run --cwd apps/md refresh:catalog
bun x ultracite fix apps/md/src/lib/catalog.json
```

Review upstream changes before shipping a catalog update. Skills retain upstream licensing and may include tool-specific assumptions. Only the explicit TDD policy conflict is automatically detected in this MVP.
