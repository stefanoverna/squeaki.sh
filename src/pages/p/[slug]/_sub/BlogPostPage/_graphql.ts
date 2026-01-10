import { ImageBlockFragment } from '~/components/DatoImage/graphql';
import { VideoBlockFragment } from '~/components/DatoVideo/graphql';
import { graphql } from '~/lib/datocms/graphql';

export const BlogPostEntriesQuery = graphql(/* GraphQL */ `
  query BlogPostEntries {
    entries: allBlogPosts {
      slug
      _locales
    }
  }
`);

export const BlogPostQuery = graphql(
  /* GraphQL */ `
    query BlogPost($slug: String!, $locale: SiteLocale) {
      blogPost(filter: { slug: { eq: $slug } }, locale: $locale) {
        id
        slug
        title
        _locales
        _firstPublishedAt
        mastodonUrl
        content {
          value
          blocks {
            ... on RecordInterface {
              id
              __typename
            }
            ...ImageBlockFragment
            ...VideoBlockFragment
          }
        }
      }
    }
  `,
  [ImageBlockFragment, VideoBlockFragment],
);
