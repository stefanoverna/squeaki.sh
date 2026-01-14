import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { defineConfig, envField } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  env: {
    schema: {
      PRIVATE_DATOCMS_READONLY_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PRIVATE_DATOCMS_READWRITE_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PRIVATE_DATOCMS_BUILD_TRIGGER_WEBHOOK: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PRIVATE_POSTMARK_SERVER_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PRIVATE_POSTMARK_WEBHOOK_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PRIVATE_NEWSLETTER_SEND_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PRIVATE_TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
    validateSecrets: true,
  },
  integrations: [react()],
  adapter: cloudflare({ imageService: 'compile' }),
  security: {
    checkOrigin: false,
  },
  // issues with card.png?
  // trailingSlash: 'always',
  vite: {
    plugins: [rawFonts(['.otf'])],
    assetsInclude: ['**/*.wasm'],
    ssr: {
      noExternal: ['workers-og'],
    },
    assetsExclude: ['**/*.otf'],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
  },
});

function rawFonts(extensions) {
  return {
    name: 'vite-plugin-raw-fonts',
    enforce: 'pre',
    resolveId(id, importer) {
      if (extensions.some((ext) => id.includes(ext))) {
        if (id.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(importer), id);
          return resolvedPath;
        }
        return id;
      }
    },
    load(id) {
      if (extensions.some((ext) => id.includes(ext))) {
        try {
          const buffer = fs.readFileSync(id);
          return `export default new Uint8Array([${Array.from(buffer).join(',')}]);`;
        } catch (error) {
          console.error('Error loading font:', error.message);
          throw error;
        }
      }
    },
  };
}
