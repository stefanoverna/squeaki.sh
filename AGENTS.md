# squeaki.sh

IndieWeb-powered personal blog built with Astro 6 + DatoCMS + Cloudflare Workers. Features webmentions, RSS aggregation, newsletter subscriptions, and POSSE workflow.

## Architecture

```
squeakish/
├── src/              # Application code (see src/AGENTS.md)
├── bin/              # Build and deployment scripts
├── scripts/          # Automation (webmention sending, etc.)
├── public/           # Static assets
└── static/           # Additional static files
```

## Tech Stack

**Core:** Astro 6 (SSR + Static), Preact (in compat mode), TypeScript, Node >= 22
**Content:** DatoCMS headless CMS with GraphQL API (gql.tada for type-safe queries)
**Hosting:** Cloudflare Workers with Workers Builds (auto-deploy from main). Scheduled rebuilds daily via GitHub Actions.
**Services:** Postmark (newsletter), Turnstile (bot protection), webmention.io (social interactions)
**Runtime:** Cloudflare Workers (workerd) — bindings accessed via `import { env } from 'cloudflare:workers'`

## Key Invariants

- **DatoCMS is single source of truth** for content. All blog posts, pages, and feed sources live there
- **Environment variables are strongly typed** via Astro's `envField` schema (astro.config.mjs:8-44)
- **Scheduled rebuilds daily (midnight UTC)** to sync Mastodon interactions and update feed aggregator
- **GraphQL schema is generated** from DatoCMS - run `npm run generate-schema` after schema changes
- **Font files (.otf) loaded as raw Uint8Array** via custom Vite plugin for OG image generation

## IndieWeb Workflows

### Publishing Content

1. Create/edit content in DatoCMS
2. Automatic rebuild via webhook OR wait for scheduled build
3. Share on Mastodon with link to post
4. Next build syncs Mastodon interactions via Brid.gy

### Webmention Flow

- **Receiving:** webmention.io collects likes/reposts/comments from other sites
- **Backfeeding:** Brid.gy bridges Mastodon reactions as webmentions
- **Sending:** `bin/send-webmentions` parses RSS and notifies linked sites

## Anti-patterns

- Never hardcode API tokens - all secrets via env schema and `cloudflare:workers` env
- Don't use `Astro.locals.runtime` - use `import { env } from 'cloudflare:workers'` instead
- Never edit GraphQL schema manually - regenerate from DatoCMS
- Don't commit .env file - use .env.example as template

## Build & Deployment

```bash
npm run dev              # Local development
npm run build            # Production build (via bin/build)
npm run dev:wrangler     # Test with Cloudflare runtime locally
npm run generate-schema  # Regenerate GraphQL types from DatoCMS
```

Deployment: Cloudflare Workers auto-deploys from main branch via Workers Builds. GitHub Actions triggers rebuilds daily at midnight UTC. All PRIVATE_* secrets must be set both as Worker secrets (runtime) and as Workers Builds env vars (build-time, for workerd prerendering).

## Intent Layer

**Before modifying code in src/, read src/AGENTS.md** to understand component patterns, DatoCMS integration, and routing structure.

- **Source code**: `src/AGENTS.md` - Components, pages, actions, and utilities
