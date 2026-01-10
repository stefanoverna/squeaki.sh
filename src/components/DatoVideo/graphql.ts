import { graphql } from '~/lib/datocms/graphql';
import { VideoPlayerFragment } from '~/components/VideoPlayer/graphql';

export const VideoBlockFragment = graphql(
  /* GraphQL */ `
    fragment VideoBlockFragment on VideoRecord {
      id
      video {
        ...VideoPlayerFragment
      }
    }
  `,
  [VideoPlayerFragment],
);
