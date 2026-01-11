import { BlogPostContentFragment } from '~/lib/blog-post-html';
import { graphql } from '~/lib/datocms/graphql';

export const FeedQuery = graphql(
  /* GraphQL */ `
    query Feed {
      blogPosts: allBlogPosts(orderBy: _firstPublishedAt_DESC) {
        id
        title
        slug
        _firstPublishedAt
        content {
          ...BlogPostContentFragment
        }
      }
    }
  `,
  [BlogPostContentFragment],
);
