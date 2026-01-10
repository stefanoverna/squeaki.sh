import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import expressiveCode from 'astro-expressive-code';
import react from '@astrojs/react';

export default defineConfig({
  env: {
    schema: {
      DATOCMS_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      DATOCMS_READWRITE_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      DATOCMS_BUILD_TRIGGER_WEBHOOK: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      POSTMARK_SERVER_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      POSTMARK_WEBHOOK_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      NEWSLETTER_SEND_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PUBLIC_SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
    validateSecrets: true,
  },
  integrations: [
    react(),
    expressiveCode({
      themes: ['dracula'],
      styleOverrides: {
        borderRadius: '5px',
        fontSize: '0.8em',
      },
    }),
  ],
  adapter: cloudflare(),
  security: {
    checkOrigin: false,
  },
  trailingSlash: 'never',
  vite: {
    ssr: {
      external: ['fs', 'path', 'url', 'child_process', 'stream'],
    },
  },
});
