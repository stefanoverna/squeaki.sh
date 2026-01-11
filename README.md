# squeaki.sh

## Tech Stack

- **[Astro](https://astro.build/)** - Modern static site framework
- **[DatoCMS](https://www.datocms.com/)** - Headless CMS for content management
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Hosting and deployment platform
- **[Postmark](https://postmarkapp.com/)** - Email service for newsletter subscriptions
- **[webmention.io](https://webmention.io/)** - Webmention receiving service
- **[Brid.gy](https://brid.gy)** - Social media backfeeding bridge

## Features

### IndieWeb Integration

This blog is built with full IndieWeb principles, embracing an open and decentralized web. It takes an "omakase" approach: a curated, simplified path to IndieWeb adoption that prioritizes data ownership and reduces platform dependency.

> **📖 Read the full guide:** [The Dumb Guide to Join the IndieWeb](https://squeaki.sh/p/the-dumb-guide-to-join-the-indieweb/) explains the philosophy and implementation details behind this setup.

#### Webmentions & Social Sync

A bidirectional notification system that enables distributed social interactions:

- **Receiving:** Collects likes, reposts, and comments via [webmention.io](https://webmention.io/).
- **Backfeeding:** Bridges Mastodon reactions into webmentions using [Brid.gy](https://brid.gy). Automated scripts link the original article to the author's Mastodon sharing post.
- **Sending:** Automatically notifies sites mentioned in your posts by parsing your RSS feed.

#### Microformats

Semantic HTML classes (h-card, h-entry, h-feed) that make website content machine-readable, enabling automated tools to discover and parse your content intelligently.

#### Identity & Syndication

- **rel=me** links for identity verification (Mastodon, GitHub).
- **POSSE** (Publish on your Own Site, Syndicate Elsewhere) workflow.
- `u-syndication` links and Fediverse creator attribution.

#### RSS Feed

- Full RSS 2.0 feed at `/rss.xml`, styled with XSL for human-readable viewing.
- Autodiscoverable and used for automated webmention sending.

### Content & Newsletter

- **Multilingual support** (English and Italian) with DatoCMS Structured Text.
- **Rich media** support, code syntax highlighting, and dynamic Open Graph images.
- **Newsletter:** Managed via Postmark with Cloudflare Turnstile bot protection and opt-in.

---

## Installation & Deployment

### Local Setup

```bash
# Install dependencies
npm install

# Generate GraphQL schema from DatoCMS
npm run generate-schema

# Start development server
npm run dev

```

### Build Process

The blog is deployed to **Cloudflare Pages** with an automated build schedule:

- **Scheduled rebuilds:** Every 30 minutes via GitHub Actions to sync Mastodon URLs and update the News feed.
- **On-demand builds:** Triggered by DatoCMS webhooks.

---

## IndieWeb Workflow

1. **Create and publish** content in DatoCMS.
2. **Wait for rebuild** (automatic every 30 mins or manual via webhook).
3. **Share on Mastodon** with a link to your post.
4. **Sync & Notify:** On the next build, the site automatically syncs Mastodon interactions and sends out webmentions to any sites you linked to.

---

## Credits

- Built with love using Astro and DatoCMS.
- Hosted on Cloudflare Pages.
- IndieWeb integration powered by webmention.io and Brid.gy.
- Part of the open, decentralized web.

Made with ❤️ for the IndieWeb community
