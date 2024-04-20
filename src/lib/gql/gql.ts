/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n\tfragment BlogPostExcerptFragment on BlogPostRecord {\n\t\tid\n\t\tslug\n\t\ttitle\n\t\t_firstPublishedAt\n\t\tcontent {\n\t\t\tvalue\n\t\t}\n\t}\n": types.BlogPostExcerptFragmentFragmentDoc,
    "\n\tquery Home {\n\t\tblogPosts: allBlogPosts(first: 100, orderBy: _firstPublishedAt_DESC) {\n\t\t\tid\n\t\t\t...BlogPostExcerptFragment\n\t\t}\n\t}\n": types.HomeDocument,
    "\n\t\tquery Feeds {\n\t\t\tsources: allRssFeeds(first: 100) {\n\t\t\t\tid\n\t\t\t\ttitle\n\t\t\t\tfeedUrl\n\t\t\t\twebsiteUrl\n\t\t\t}\n\t\t}\n\t": types.FeedsDocument,
    "\n\tquery NewsletterSend {\n\t\tblogPosts: allBlogPosts(\n\t\t\torderBy: _firstPublishedAt_ASC\n\t\t\tfilter: { sentToNewsletter: { eq: false } }\n\t\t) {\n\t\t\tid\n\t\t\ttitle\n\t\t\tslug\n\t\t\t...BlogPostFragment\n\t\t}\n\t}\n": types.NewsletterSendDocument,
    "\n\t\tquery BlogPostEntries {\n\t\t\tentries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t": types.BlogPostEntriesDocument,
    "\n\t\tquery BlogPost($slug: String!) {\n\t\t\tblogPost(filter: { slug: { eq: $slug } }) {\n\t\t\t\t...BlogPostFragment\n\n\t\t\t\tmastodonUrl\n\t\t\t}\n\t\t}\n\t": types.BlogPostDocument,
    "\n\t\tquery BlogPostCardEntries {\n\t\t\tentries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t": types.BlogPostCardEntriesDocument,
    "\n\t\tquery BlogPostCard($slug: String!) {\n\t\t\tblogPost(filter: { slug: { eq: $slug } }) {\n\t\t\t\ttitle\n\t\t\t\tcontent {\n\t\t\t\t\tvalue\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t": types.BlogPostCardDocument,
    "\n\tfragment BlogPostFragment on BlogPostRecord {\n\t\tid\n\t\tslug\n\t\ttitle\n\t\t_firstPublishedAt\n\t\tcontent {\n\t\t\tvalue\n\n\t\t\tblocks {\n\t\t\t\t...BlockFragment\n\t\t\t}\n\t\t}\n\t}\n": types.BlogPostFragmentFragmentDoc,
    "\n\tfragment BlockFragment on BlogPostModelContentBlocksField {\n\t\t... on RecordInterface {\n\t\t\tid\n\t\t\t__typename\n\t\t}\n\t\t... on ImageRecord {\n\t\t\timage {\n\t\t\t\tresponsiveImage(\n\t\t\t\t\timgixParams: { w: 750, fit: max }\n\t\t\t\t\tsizes: \"(min-width: 780px) 64rem, 100vw\"\n\t\t\t\t) {\n\t\t\t\t\talt\n\t\t\t\t\tbase64\n\t\t\t\t\tsizes\n\t\t\t\t\tsrc\n\t\t\t\t\tsrcSet\n\t\t\t\t\ttitle\n\t\t\t\t\twidth\n\t\t\t\t\theight\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t... on VideoRecord {\n\t\t\tvideo {\n\t\t\t\tvideo {\n\t\t\t\t\tmuxPlaybackId\n\t\t\t\t\ttitle\n\t\t\t\t\twidth\n\t\t\t\t\theight\n\t\t\t\t\tblurUpThumb\n\t\t\t\t\tmp4Url: mp4Url(res: low)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n": types.BlockFragmentFragmentDoc,
    "\n\tquery Feed {\n\t\tblogPosts: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t...BlogPostFragment\n\t\t}\n\t}\n": types.FeedDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment BlogPostExcerptFragment on BlogPostRecord {\n\t\tid\n\t\tslug\n\t\ttitle\n\t\t_firstPublishedAt\n\t\tcontent {\n\t\t\tvalue\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment BlogPostExcerptFragment on BlogPostRecord {\n\t\tid\n\t\tslug\n\t\ttitle\n\t\t_firstPublishedAt\n\t\tcontent {\n\t\t\tvalue\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Home {\n\t\tblogPosts: allBlogPosts(first: 100, orderBy: _firstPublishedAt_DESC) {\n\t\t\tid\n\t\t\t...BlogPostExcerptFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Home {\n\t\tblogPosts: allBlogPosts(first: 100, orderBy: _firstPublishedAt_DESC) {\n\t\t\tid\n\t\t\t...BlogPostExcerptFragment\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\t\tquery Feeds {\n\t\t\tsources: allRssFeeds(first: 100) {\n\t\t\t\tid\n\t\t\t\ttitle\n\t\t\t\tfeedUrl\n\t\t\t\twebsiteUrl\n\t\t\t}\n\t\t}\n\t"): (typeof documents)["\n\t\tquery Feeds {\n\t\t\tsources: allRssFeeds(first: 100) {\n\t\t\t\tid\n\t\t\t\ttitle\n\t\t\t\tfeedUrl\n\t\t\t\twebsiteUrl\n\t\t\t}\n\t\t}\n\t"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery NewsletterSend {\n\t\tblogPosts: allBlogPosts(\n\t\t\torderBy: _firstPublishedAt_ASC\n\t\t\tfilter: { sentToNewsletter: { eq: false } }\n\t\t) {\n\t\t\tid\n\t\t\ttitle\n\t\t\tslug\n\t\t\t...BlogPostFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery NewsletterSend {\n\t\tblogPosts: allBlogPosts(\n\t\t\torderBy: _firstPublishedAt_ASC\n\t\t\tfilter: { sentToNewsletter: { eq: false } }\n\t\t) {\n\t\t\tid\n\t\t\ttitle\n\t\t\tslug\n\t\t\t...BlogPostFragment\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\t\tquery BlogPostEntries {\n\t\t\tentries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t"): (typeof documents)["\n\t\tquery BlogPostEntries {\n\t\t\tentries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\t\tquery BlogPost($slug: String!) {\n\t\t\tblogPost(filter: { slug: { eq: $slug } }) {\n\t\t\t\t...BlogPostFragment\n\n\t\t\t\tmastodonUrl\n\t\t\t}\n\t\t}\n\t"): (typeof documents)["\n\t\tquery BlogPost($slug: String!) {\n\t\t\tblogPost(filter: { slug: { eq: $slug } }) {\n\t\t\t\t...BlogPostFragment\n\n\t\t\t\tmastodonUrl\n\t\t\t}\n\t\t}\n\t"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\t\tquery BlogPostCardEntries {\n\t\t\tentries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t"): (typeof documents)["\n\t\tquery BlogPostCardEntries {\n\t\t\tentries: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\t\tquery BlogPostCard($slug: String!) {\n\t\t\tblogPost(filter: { slug: { eq: $slug } }) {\n\t\t\t\ttitle\n\t\t\t\tcontent {\n\t\t\t\t\tvalue\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t"): (typeof documents)["\n\t\tquery BlogPostCard($slug: String!) {\n\t\t\tblogPost(filter: { slug: { eq: $slug } }) {\n\t\t\t\ttitle\n\t\t\t\tcontent {\n\t\t\t\t\tvalue\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment BlogPostFragment on BlogPostRecord {\n\t\tid\n\t\tslug\n\t\ttitle\n\t\t_firstPublishedAt\n\t\tcontent {\n\t\t\tvalue\n\n\t\t\tblocks {\n\t\t\t\t...BlockFragment\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment BlogPostFragment on BlogPostRecord {\n\t\tid\n\t\tslug\n\t\ttitle\n\t\t_firstPublishedAt\n\t\tcontent {\n\t\t\tvalue\n\n\t\t\tblocks {\n\t\t\t\t...BlockFragment\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment BlockFragment on BlogPostModelContentBlocksField {\n\t\t... on RecordInterface {\n\t\t\tid\n\t\t\t__typename\n\t\t}\n\t\t... on ImageRecord {\n\t\t\timage {\n\t\t\t\tresponsiveImage(\n\t\t\t\t\timgixParams: { w: 750, fit: max }\n\t\t\t\t\tsizes: \"(min-width: 780px) 64rem, 100vw\"\n\t\t\t\t) {\n\t\t\t\t\talt\n\t\t\t\t\tbase64\n\t\t\t\t\tsizes\n\t\t\t\t\tsrc\n\t\t\t\t\tsrcSet\n\t\t\t\t\ttitle\n\t\t\t\t\twidth\n\t\t\t\t\theight\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t... on VideoRecord {\n\t\t\tvideo {\n\t\t\t\tvideo {\n\t\t\t\t\tmuxPlaybackId\n\t\t\t\t\ttitle\n\t\t\t\t\twidth\n\t\t\t\t\theight\n\t\t\t\t\tblurUpThumb\n\t\t\t\t\tmp4Url: mp4Url(res: low)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment BlockFragment on BlogPostModelContentBlocksField {\n\t\t... on RecordInterface {\n\t\t\tid\n\t\t\t__typename\n\t\t}\n\t\t... on ImageRecord {\n\t\t\timage {\n\t\t\t\tresponsiveImage(\n\t\t\t\t\timgixParams: { w: 750, fit: max }\n\t\t\t\t\tsizes: \"(min-width: 780px) 64rem, 100vw\"\n\t\t\t\t) {\n\t\t\t\t\talt\n\t\t\t\t\tbase64\n\t\t\t\t\tsizes\n\t\t\t\t\tsrc\n\t\t\t\t\tsrcSet\n\t\t\t\t\ttitle\n\t\t\t\t\twidth\n\t\t\t\t\theight\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t... on VideoRecord {\n\t\t\tvideo {\n\t\t\t\tvideo {\n\t\t\t\t\tmuxPlaybackId\n\t\t\t\t\ttitle\n\t\t\t\t\twidth\n\t\t\t\t\theight\n\t\t\t\t\tblurUpThumb\n\t\t\t\t\tmp4Url: mp4Url(res: low)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Feed {\n\t\tblogPosts: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t...BlogPostFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Feed {\n\t\tblogPosts: allBlogPosts(orderBy: _firstPublishedAt_DESC) {\n\t\t\t...BlogPostFragment\n\t\t}\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;