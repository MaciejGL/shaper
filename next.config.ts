import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		// reactCompiler: true,
		turbo: {
			rules: {
				'*.graphql': {
					loaders: ['raw-loader'],
					as: '*.js',
				},
			},
		},
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/login',
				permanent: true,
			},
		];
	},
	webpack: config => {
		config.module.rules.push({
			test: /\.(graphql|gql)$/,
			exclude: /node_modules/,
			loader: 'graphql-tag/loader',
		});
		return config;
	},
};

export default nextConfig;
