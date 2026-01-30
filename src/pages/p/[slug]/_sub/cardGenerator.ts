import { ImageResponse } from 'workers-og';
import { datocms } from '~/lib/datocms';
import { graphql } from '~/lib/datocms/graphql';
import GeistBoldData from './fonts/Geist-Bold.otf';
import GeistMediumData from './fonts/Geist-Medium.otf';

export async function generateCardImage(slug: string, locale: string = 'en'): Promise<Response> {
  // Font data is now properly loaded as Uint8Array by the rawFonts plugin
  const GeistBold = (GeistBoldData as any).buffer || GeistBoldData;
  const GeistMedium = (GeistMediumData as any).buffer || GeistMediumData;

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

  const html = `
    <div
      style="display: flex; flex-direction: column; padding: 51px 68px; background: white; border-bottom: 17px solid #0074e4; width: 1200px; height: 630px;"
    >
      <div style="display: flex; font-size: 94px; flex-grow: 1; font-weight: 800; align-items: center; letter-spacing: -0.08em; line-height: 1;">
        ${blogPost.title}
      </div>
      <div style="display: flex; font-size: 34px; font-weight: 600; color: #0074e4; letter-spacing: -0.07em;">
        squeaki.sh
      </div>
    </div>
  `;

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Geist',
        data: GeistBold,
        weight: 800,
      },
      {
        name: 'Geist',
        data: GeistMedium,
        weight: 600,
      },
    ],
    debug: true,
  });
}
