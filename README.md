# anyway-design

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, and more.

## Features

The documentation prototype lives in [`apps/docs`](apps/docs/README.md). Run `bun run dev:docs` to open the MDX guide and live component page at `http://127.0.0.1:3007`.

The product documentation and integrated macOS workbench live in [`apps/platform`](apps/platform/README.md). Run `bun run dev:platform` to open **Anyway / platform** at `http://127.0.0.1:3008`; `bun run build:platform` builds the app and its macOS Lab dependency.

The macOS React component playground lives in [`apps/macos-lab`](apps/macos-lab/README.md), backed by [`packages/macos`](packages/macos/README.md). Run `bun run dev:macos` to preview the Sequoia and Tahoe presets at `http://127.0.0.1:3006`.

The agent setup builder lives in [`apps/md`](apps/md/README.md). Run `bun run --cwd apps/md db:local`, then `bun run dev:md` to open it at `http://127.0.0.1:3002`.

The minimal planning canvas lives in [`apps/plan`](apps/plan/README.md). Run `bun run dev:plan` to open it at `http://127.0.0.1:3004`.

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open the URL printed by Portless (for example, `https://infra.localhost`) in your browser.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@anyway-design/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Deployment

### Alchemy

- Target: web on Cloudflare
- Configure provider login: `cd packages/infra && bunx alchemy login --configure`
- Dev: bun run dev
- Deploy: bun run deploy
- Destroy: bun run destroy

`alchemy login --configure` stores the selected Cloudflare, Neon, PlanetScale, and/or Prisma provider profiles under `~/.alchemy`; no provider-specific setup command is required by this scaffold.

Deploys are staged and default to a personal `dev_<username>` stage. For production, run the deploy with an explicit stage from `packages/infra`:

```bash
cd packages/infra && bun run deploy --stage production
```

## Git Hooks and Formatting

- Run checks: `bun run check`

## Project Structure

```
anyway-design/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   ├── docs/        # Anyway documentation (Fumadocs + MDX)
│   ├── md/          # Skills and AGENTS.md builder, anonymous D1 saves
│   ├── plan/        # Premade blocks, connections, and optional WebMCP tools
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── md-cli/      # Dependency-free installer, packaged by apps/md
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:docs`: Start the documentation prototype
- `bun run build:docs`: Build the documentation prototype
- `bun run check-types`: Check TypeScript types across all apps
- `bun run check`: Run Biome formatting and linting
