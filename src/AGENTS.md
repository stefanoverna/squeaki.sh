# Source Code

Application source for squeaki.sh blog. Astro-based SSR/static hybrid with React components, DatoCMS integration, and API routes.

## Structure

```
src/
├── components/       # Reusable UI components (Astro + Preact)
├── pages/           # File-based routing (pages + API endpoints)
│   └── feed/        # RSS aggregator (see pages/feed/AGENTS.md)
├── layouts/         # Page layout templates
├── actions/         # Astro actions (form handling)
├── lib/             # Utilities and shared logic
│   ├── datocms/    # DatoCMS GraphQL setup
│   └── utils/      # Helper functions
└── styles/          # Global CSS
```

## Entry Points

- `pages/index.astro` - Homepage
- `pages/p/[slug]/[locale]/index.astro` - Blog post pages (multilingual)
- `pages/feed/` - RSS feed aggregator (see `pages/feed/AGENTS.md`)
- `pages/rss.xml.ts` - RSS feed generation
- `pages/newsletter/` - Newsletter subscription flows

## Components

### DatoCMS Components Pattern

Components that render DatoCMS content follow a modular pattern:

- `Component.astro` - UI implementation
- `graphql.ts` - Fragment definitions (owned by component, never reused)
- `index.ts` - Re-exports with types

**Fragment Ownership:** Each component must define its own GraphQL fragments, even if fields overlap with other components. This enables fragment masking and prevents coupling between components.

Examples: `BlogPostExcerpt/`, `DatoImage/`, `DatoVideo/`, `VideoPlayer/`

### Standalone Components

- `Bio.astro` - Author biography
- `Comment.astro` - Webmention comment display
- `Form.astro` - Generic form wrapper
- `LikeOrRepost.astro` - Social interaction indicators
- `MentionAuthorAvatar.astro` - Avatar for webmention authors
- `CodeNode.astro` - Syntax-highlighted code blocks
- `Logo.astro` - Site logo

## Pages & Routing

### Blog Posts (`pages/p/[slug]/`)

- `[locale]/index.astro` - Localized post pages (EN/IT)
- `[locale]/card.png.ts` - Dynamic OG image generation
- `index.astro` - Redirect to default locale
- `_sub/BlogPostPage/` - Main post component with GraphQL fragments
- `_sub/cardGenerator.ts` - workers-og based OG image logic

### Feed Aggregator (`pages/feed/`)

**See `pages/feed/AGENTS.md` for complete documentation.**

- RSS/Atom feed parsing with KV caching
- Read state tracking with token-based auth
- Stale-while-revalidate pattern for performance

### Newsletter (`pages/newsletter/`)

- `subscribe/index.astro` - Subscription form page
- `api/subscription-change.ts` - Handle Postmark webhook for unsubs
- `api/send.ts` - Authenticated endpoint to send newsletter via Postmark

### GraphQL Queries

- `_graphql.ts` - Shared fragments for blog post queries
- `_rss_graphql.ts` - RSS feed specific queries

## Actions

Astro actions provide type-safe server functions for forms:

- `actions/newsletter/subscribe.ts` - Newsletter subscription with Turnstile validation

## Libraries

### DatoCMS Integration (`lib/datocms/`)

- `datocms.ts` - Main query executor with auto-pagination
  - Uses `@datocms/cda-client` for Content Delivery API
  - Includes drafts in dev mode (`includeDrafts: import.meta.env.DEV`)
  - Type-safe via `gql.tada` TadaDocumentNode
- `graphql.ts` - GraphQL schema and utilities (generated)
- `graphql-env.d.ts` - TypeScript definitions

### Utilities (`lib/utils/`)

- `webmentions.ts` - Fetch and process webmentions from webmention.io
- `newsletter.ts` - Postmark integration helpers
- `apiResponses.ts` - Standard API response builders
- `hash.ts` - Hashing utilities (email obfuscation, etc.)
- `constants.ts` - Shared constants

### Content Processing

- `blog-post-html.ts` - Convert DatoCMS Structured Text to HTML

## Contracts & Invariants

- **All DatoCMS queries must use `lib/datocms.ts` wrapper** - handles pagination, token, draft mode
- **GraphQL fragments live with components** - co-locate queries with UI (e.g., `DatoImage/graphql.ts`)
- **Route-specific components go in `_sub/` directories** - if a component is only used by one route, place it in a `_sub/` directory within that route in `src/pages/`. The leading `_` makes Astro ignore it for routing. Once a component is reused elsewhere, move it to `src/components/`
- **API routes return JSON via `lib/utils/apiResponses.ts`** - consistent response format
- **Dynamic OG images use workers-og** - loaded fonts as Uint8Array via Vite plugin
- **Newsletter actions require auth token** - `PRIVATE_NEWSLETTER_SEND_API_TOKEN` check
- **Turnstile validation on public forms** - prevents bot submissions

## Patterns

### Adding a New DatoCMS Component

1. Create directory in `components/` (e.g., `NewComponent/`)
2. Add `graphql.ts` with **owned fragment definition** (never reuse existing fragments)
3. Add `Component.astro` with UI implementation
4. Add `index.ts` to re-export with types
5. Compose fragment in parent query using fragment spreads

**Fragment Ownership Example:**

```typescript
// components/NewComponent/graphql.ts
export const NewComponentFragment = graphql(`
  fragment NewComponentFragment on BlogPost {
    id
    title
  }
`);

// pages/example/_graphql.ts
import { NewComponentFragment } from '~/components/NewComponent';

const query = graphql(
  `
    query Example {
      post {
        ...NewComponentFragment
      }
    }
  `,
  [NewComponentFragment],
);
```

See: https://gql-tada.0no.co/get-started/writing-graphql

### Adding a New API Endpoint

1. Create file in `pages/*/api/` (e.g., `pages/api/my-endpoint.ts`)
2. Export GET/POST functions with Astro APIContext
3. Use `lib/utils/apiResponses.ts` for consistent responses
4. Add authentication check for sensitive operations

### Working with Webmentions

- Fetch via `lib/utils/webmentions.ts`
- Display with `Comment.astro`, `LikeOrRepost.astro`
- Sending happens at build time via `bin/send-webmentions` script

## Anti-patterns

- Never query DatoCMS directly without `lib/datocms.ts` wrapper
- **Don't reuse GraphQL fragments across components** - each component owns its fragments (enables fragment masking)
- Never expose API tokens in client-side code - use Astro's server context
- Don't hardcode feed sources - store in DatoCMS and query dynamically
- Avoid inline styles - use global CSS from `styles/` or Tailwind classes

## Pitfalls

- **Preact in compat mode:** Using `preact/compat` aliased as `react` - some React 19 features unavailable
- **Edge runtime for Preact:** Must use `react-dom/server.edge` (configured in astro.config.mjs:63)
- **Draft content in dev:** `includeDrafts` is enabled in dev mode - may see unpublished posts locally
- **Font loading for OG images:** .otf files must be loaded as Uint8Array, not via standard imports
- **Cloudflare adapter required:** API routes depend on Cloudflare Pages context
