import { type BlogPostFragmentFragment } from '$lib/gql/graphql';
import { unwindContent } from '$lib/utils/unwindBlogPostContent';
import { render as toHtml } from 'datocms-structured-text-to-html-string';

export function toContentToHtml(data: BlogPostFragmentFragment) {
	const content = unwindContent(data.content);

	return toHtml(content, {
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
								src: record.video.video?.mp4Url || '',
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
							srcset: record.image.responsiveImage.srcSet,
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
	});
}
