import 'dotenv/config';
import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
	schema: [
		{
			'https://graphql.datocms.com': {
				headers: {
					Authorization: `Bearer ${process.env.PRIVATE_DATOCMS_READONLY_API_TOKEN}`,
					'X-Exclude-Invalid': 'true',
				},
			},
		},
	],
	documents: ['./**/*.ts'],
	extensions: {
		codegen: {
			generates: {
				'./src/lib/gql/': {
					preset: 'client',
					presetConfig: {
						fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
					},
					config: {
						// String documentMode (https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#when-to-use-a-string-documentmode) does not work with nested fragments
						// documentMode: "string",
						strictScalars: true,
						scalars: {
							BooleanType: 'boolean',
							CustomData: 'Record<string, unknown>',
							Date: 'string',
							DateTime: 'string',
							FloatType: 'number',
							IntType: 'number',
							ItemId: 'string',
							JsonField: 'unknown',
							MetaTagAttributes: 'Record<string, string>',
							UploadId: 'string',
							SiteLocale: 'string',
						},
					},
				},
			},
		},
	},
};

export default config;
