import { graphql } from '~/lib/datocms/graphql';

export const ImageBlockFragment = graphql(/* GraphQL */ `
  fragment ImageBlockFragment on ImageRecord {
    id
    image {
      responsiveImage(imgixParams: { w: 750, fit: max }, sizes: "(min-width: 780px) 64rem, 100vw") {
        alt
        base64
        sizes
        src
        srcSet
        title
        width
        height
      }
    }
  }
`);
