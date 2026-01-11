import { render as toHtml } from 'datocms-structured-text-to-html-string';
import { type FragmentOf, graphql, readFragment } from '~/lib/datocms/graphql';

export const BlogPostContentFragment = graphql(/* GraphQL */ `
  fragment BlogPostContentFragment on BlogPostModelContentField {
    value
    blocks {
      ... on RecordInterface {
        id
        __typename
      }
      ... on ImageRecord {
        image {
          responsiveImage(imgixParams: { w: 750, fit: max }) {
            alt
            src
            title
          }
        }
      }
      ... on VideoRecord {
        video {
          video {
            mp4Url
          }
        }
      }
    }
  }
`);

export function blogPostToHtmlString(
  maskedContent: FragmentOf<typeof BlogPostContentFragment>,
): string {
  const content = readFragment(BlogPostContentFragment, maskedContent);

  return (
    toHtml(content, {
      renderBlock({ record, adapter: { renderNode: tag } }) {
        switch (record.__typename) {
          case 'VideoRecord': {
            return tag(
              'p',
              null,
              tag(
                'video',
                { controls: 'true', style: 'width: 100%' },
                tag('source', {
                  src: record.video.video.mp4Url || '',
                  type: 'video/mp4',
                }),
              ),
            );
          }
          case 'ImageRecord': {
            return tag(
              'p',
              null,
              tag('img', {
                src: record.image.responsiveImage.src,
                alt: record.image.responsiveImage.alt || '',
                title: record.image.responsiveImage.title || '',
                style: 'width: 100%',
              }),
            );
          }
          default: {
            return '';
          }
        }
      },
    }) || ''
  );
}
