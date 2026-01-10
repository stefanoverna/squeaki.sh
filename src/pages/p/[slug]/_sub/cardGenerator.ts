import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { readingTime } from 'reading-time-estimator';
import satori from 'satori';
import { html } from 'satori-html';
import { fileURLToPath } from 'url';
import { datocms } from '~/lib/datocms';
import { graphql } from '~/lib/datocms/graphql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize WASM module
let wasmInitialized = false;

async function ensureWasmInitialized() {
  if (!wasmInitialized) {
    const wasmUrl = new URL('@resvg/resvg-wasm/index_bg.wasm', import.meta.url);
    await initWasm(wasmUrl);
    wasmInitialized = true;
  }
}

function getFonts() {
  // From src/pages/p/[slug]/, go up 3 levels to src/, then into lib/fonts/
  const boldFont = readFileSync(join(__dirname, '../../../lib/fonts/Geist-Bold.otf'));
  const mediumFont = readFileSync(join(__dirname, '../../../lib/fonts/Geist-Medium.otf'));
  return { boldFont, mediumFont };
}

export async function generateCardImage(slug: string, locale: string = 'en'): Promise<Response> {
  await ensureWasmInitialized();

  const { boldFont, mediumFont } = getFonts();

  const query = graphql(/* GraphQL */ `
    query BlogPostCard($slug: String!, $locale: SiteLocale) {
      blogPost(filter: { slug: { eq: $slug } }, locale: $locale) {
        title
        content {
          value
        }
      }
    }
  `);

  const { blogPost } = await datocms(query, {
    slug,
    locale: locale as 'it' | 'en',
  });

  if (!blogPost) {
    return new Response('not found', { status: 404 });
  }

  const { text } = readingTime(toPlainText((blogPost as any).content.value as any) || '');

  const markup = html`
    <div
      style="display: flex; flex-direction: column; padding: 30px 40px; background: white; height: 100%; border-bottom: 10px solid #0074e4;"
    >
      <div style="display: flex">
        <span
          style="background: #d6ebff; color: #344651; text-transform: uppercase; font-size: 13px; padding: 5px; border-radius: 5px;"
        >
          ${text}
        </span>
      </div>
      <div
        style="font-size: 55px; flex-grow: 1; font-weight: 800; align-items: center; letter-spacing: -0.05em; line-height: 1;"
      >
        ${(blogPost as any).title}
      </div>
      <div style="font-size: 20px; font-weight: 600; color: #0074e4; letter-spacing: -0.04em;">
        squeaki.sh
      </div>
    </div>
  `;

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Geist', data: boldFont, weight: 800 },
      { name: 'Geist', data: mediumFont, weight: 600 },
    ],
  });

  // Use resvg-wasm
  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [boldFont, mediumFont],
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(Buffer.from(pngBuffer), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
