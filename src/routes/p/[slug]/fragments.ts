import { graphql } from '$lib/gql';

export const BlogPostFragment = graphql(/* GraphQL */ `
	fragment BlogPostFragment on BlogPostRecord {
		id
		slug
		title
		_firstPublishedAt
		content {
			value

			blocks {
				...BlockFragment
			}
		}
	}
`);

export const BlockFragment = graphql(/* GraphQL */ `
	fragment BlockFragment on BlogPostModelContentBlocksField {
		... on RecordInterface {
			id
			__typename
		}
		... on ImageRecord {
			image {
				responsiveImage(
					imgixParams: { w: 750, fit: max }
					sizes: "(min-width: 780px) 64rem, 100vw"
				) {
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
		... on VideoRecord {
			video {
				video {
					muxPlaybackId
					title
					width
					height
					blurUpThumb
					mp4Url: mp4Url(res: low)
				}
			}
		}
	}
`);
