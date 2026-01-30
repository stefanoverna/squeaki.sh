# RSS Feed Aggregator

Personal RSS reader that fetches feeds from DatoCMS sources, displays them with grouping logic, and tracks read state. Optimized for Cloudflare Workers with KV caching.

## Structure

```
feed/
├── index.astro              # Main feed page
├── api/
│   ├── items.json.ts        # Feed fetching + KV caching
│   └── read.ts              # Read state persistence
└── _sub/
    ├── NewsFeed/            # Main feed component
    ├── FeedItemCard/        # Expanded feed item display
    ├── CompactFeedItem/     # Collapsed additional items
    └── utils.ts             # Feed parsing, grouping logic
```

## Data Flow

```
DatoCMS (sources) → utils.ts (fetchFeeds) → items.json.ts (caching) → NewsFeed.tsx (UI)
                                                      ↓
                                          Cloudflare KV (NEWS_KV)
                                                      ↓
                                          read.ts (read state) ← user interactions
```

## API Endpoints

### `/feed/api/items.json` (GET)

**Purpose:** Fetch and aggregate RSS/Atom feeds with stale-while-revalidate caching

**Cache Strategy:**

- KV key: `feed-items`
- TTL: 30 minutes
- Stale data returned immediately + background refresh via `waitUntil`
- Cache headers: `X-Cache: HIT | STALE | MISS`

**Response:**

```typescript
{
  sources: Source[],           // DatoCMS feed sources
  groupedItems: GroupedItem[], // Items grouped by source
  erroredSources: Source[],    // Failed feed fetches
  generatedAt: string          // ISO timestamp
}
```

**Dependencies:** `NEWS_KV` binding (Cloudflare KV)

### `/feed/api/read` (GET/POST)

**Purpose:** Persist read item IDs for authenticated users

**Auth:** Query param `?token=PRIVATE_NEWS_TOKEN` (see astro:env/server)

**GET:** Returns array of read item IDs (up to 5000)
**POST:** Adds new IDs to read list, trims to `MAX_READ_ITEMS`

**Body:**

```typescript
{ ids: string[] }
```

**Storage:** KV key `read-items`, newest IDs first

## Feed Processing Pipeline

### 1. Source Fetching (`utils.ts:fetchSources`)

- Queries all RSS feed sources from DatoCMS (`allRssFeeds`)
- Returns `Source[]` with `id`, `title`, `feedUrl`, `websiteUrl`

### 2. Feed Parsing (`utils.ts:fetchFeeds`)

**Parallelization:** All feeds fetched concurrently with `Promise.all`
**Timeout:** 10s per feed via `AbortController`
**Dev Memoization:** Caches result in-memory to avoid repeated fetches

**Per feed:**

1. Fetch RSS/Atom XML
2. Parse with `feedsmith` library
3. Extract items (RSS: `item`, Atom: `entry`)
4. Generate stable ID via `cyrb64Hash(url)`
5. Strip HTML tags, truncate description to 400 chars
6. Extract first `<img>` tag as preview image

**Error Handling:** Failed feeds added to `erroredSources`, not thrown

**Output:** Top 250 items sorted by date (newest first)

### 3. Grouping Logic (`utils.ts:groupItemsBySource`)

**Purpose:** Group multiple items from same source to reduce visual clutter

**Algorithm:**

- First item from source → `main` (expanded display)
- Subsequent items from same source → `additional[]` (compact display)
- Groups maintain chronological order

**Result Type:**

```typescript
type GroupedItem = {
  main: FeedItem;
  additional: FeedItem[];
};
```

### 4. Client-Side Filtering (`NewsFeed.tsx`)

**Read State Integration:**

- Filters out read items if `token` query param present
- Promotes first unread `additional` item to `main` if original main was read
- Re-sorts groups by effective main item date

**Optimistic Updates:** UI updates immediately, API call fire-and-forget

## Components

### `NewsFeed.tsx`

**Responsibilities:**

- Fetch items + read state on mount
- Manage read/unread filtering
- Handle `#sources` hash navigation (auto-scroll after 1s)
- Render feed groups with `FeedItemCard` + `CompactFeedItem`

**State:**

- `data`: Items response from API
- `readIds`: Set of read item IDs
- `token`: Optional auth token from `?token=` query param

**Callbacks:**

- `markAsRead(id)`: Single item
- `markAllAsRead(ids[])`: Bulk marking (for source groups)

### `FeedItemCard.tsx`

**Display:** Expanded card with image, title, description, source
**Actions:**

- Mark as read (if `onMarkRead` provided)
- Mark all from source as read (if `onMarkAllRead` + `additionalItemIds`)

### `CompactFeedItem.tsx`

**Display:** Minimal row with title
**Actions:** Mark as read on click

## Contracts & Invariants

- **Item IDs are stable** - Generated via hash of URL, not feed GUID (ensures deduplication across rebuilds)
- **KV writes must not block responses** - Use `waitUntil` for background refreshes
- **Token validation required** for read state APIs - Prevents unauthorized access
- **Max 5000 read items** - KV value size limits (trimmed on every POST)
- **Feeds timeout after 10s** - Prevents slow feeds from blocking entire aggregation
- **DatoCMS is source of truth** for feed URLs - Never hardcode sources

## Fragment Ownership

Each component must own its GraphQL fragments, even if identical to others:

```typescript
// ❌ WRONG - Reusing fragments
import { FeedSourceFragment } from '../OtherComponent/graphql';

// ✅ CORRECT - Own fragment
const query = graphql(`
  query Feeds {
    sources: allRssFeeds {
      id
      title
      feedUrl
      websiteUrl
    }
  }
`);
```

**Why:** Fragment masking prevents coupling. Components remain independently modifiable.

## Anti-patterns

- **Never bypass KV cache** - Direct `fetchFeeds()` calls waste Workers CPU time
- **Don't use feed GUIDs as IDs** - Many feeds have broken/missing GUIDs; URL hash is stable
- **Never block response on KV writes** - Use `ctx.waitUntil()` for background operations
- **Don't fetch read state without token** - Wastes KV reads and breaks auth model
- **Avoid synchronous feed fetching** - Use `Promise.all` for parallelization
- **Don't store full feed items in read state** - Store IDs only (keep KV values small)

## Pitfalls

- **Stale cache served first** - By design! Background refresh happens after response sent
- **Read state persists across devices** - Shared via token, not localStorage (intentional for multi-device use)
- **Feed parsing is lenient** - Missing fields skip items rather than fail entire source
- **Dev mode caches forever** - Restart dev server to refresh feeds during development
- **Item grouping affects main item selection** - Read filtering can change which item appears as "main"
- **Token in URL** - Required for stateless auth; don't share feed URLs publicly if using token

## Adding a New Feed Source

1. Add RSS feed in DatoCMS (`allRssFeeds` model)
2. Feed automatically included in next `fetchFeeds()` call
3. No code changes needed (sources are dynamic)

## Performance Characteristics

- **Cold start (no cache):** ~5-10s for 20-30 feeds
- **Warm cache:** <100ms response time
- **Stale cache:** <100ms response + background refresh
- **KV read/write:** ~1ms overhead per operation
- **Workers CPU:** ~50-200ms for feed parsing + grouping
