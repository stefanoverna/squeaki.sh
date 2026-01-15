/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<{
  NEWS_KV: KVNamespace;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
