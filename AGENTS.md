# squeaki.sh

IndieWeb-powered personal blog built with Astro + DatoCMS + Cloudflare Pages. Features webmentions, RSS aggregation, newsletter subscriptions, and POSSE workflow.

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

**Core:** Astro 5 (SSR + Static), Preact (in compat mode), TypeScript
**Content:** DatoCMS headless CMS with GraphQL API (gql.tada for type-safe queries)
**Hosting:** Cloudflare Pages with scheduled rebuilds (daily via GitHub Actions)
**Services:** Postmark (newsletter), Turnstile (bot protection), webmention.io (social interactions)

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

- Never hardcode API tokens - all secrets via env schema
- Don't bypass Cloudflare adapter - serverless context required for API routes
- Never edit GraphQL schema manually - regenerate from DatoCMS
- Don't commit .env file - use .env.example as template

## Build & Deployment

```bash
npm run dev              # Local development
npm run build            # Production build (via bin/build)
npm run dev:wrangler     # Test with Cloudflare runtime locally
npm run generate-schema  # Regenerate GraphQL types from DatoCMS
```

Deployment: Cloudflare Pages auto-deploys from main branch. GitHub Actions triggers rebuilds daily at midnight UTC.

## Intent Layer

**Before modifying code in src/, read src/AGENTS.md** to understand component patterns, DatoCMS integration, and routing structure.

- **Source code**: `src/AGENTS.md` - Components, pages, actions, and utilities
