import { graphql } from '~/lib/datocms/graphql';

export const BlogPostExcerptFragment = graphql(/* GraphQL */ `
  fragment BlogPostExcerptFragment on BlogPostRecord {
    id
    slug
    title
    _firstPublishedAt
    content {
      value
    }
  }
`);
