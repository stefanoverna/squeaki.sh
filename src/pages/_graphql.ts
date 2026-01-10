import { graphql } from '~/lib/datocms/graphql';
import { BlogPostExcerptFragment } from '~/components/BlogPostExcerpt/graphql';

export const HomeQuery = graphql(
  /* GraphQL */ `
    query Home {
      blogPosts: allBlogPosts(first: 100, orderBy: _firstPublishedAt_DESC) {
        id
        ...BlogPostExcerptFragment
      }
    }
  `,
  [BlogPostExcerptFragment],
);
