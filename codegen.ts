import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: './src/server/models/**/*.graphql',

	generates: {
		'./src/generated/graphql-client.ts': {
			documents: [
				'./src/app/**/*.{ts,tsx}',
				'./src/components/**/*.{ts,tsx}',
				'./src/(app|components)/**/*.graphql',
			],
			config: {
				typesPrefix: 'GQL',
				maybeValue: 'T | undefined | null',
				inputMaybeValue: 'T | undefined | null',
				reactQueryVersion: 5,
				fetcher: '../lib/graphql#fetchData',
				addInfiniteQuery: true,
				exposeQueryKeys: true,
				exposeMutationKeys: true,
				exposeFetcher: true,
				scalars: {
					DateTime: 'string',
					Date: 'string',
				},
			},
			plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
		},
		'./src/generated/graphql-server.ts': {
			config: {
				wrapEntireFieldDefinitions: true,
				typesPrefix: 'GQL',
				entireFieldWrapperValue: 'T | (() => Promise<T>) | (() => T)',
				maybeValue: 'T | undefined | null',
				fetcher: '../lib/graphql#fetchData',
			},
			plugins: ['typescript', 'typescript-resolvers'],
		},
	},
};

export default config;
