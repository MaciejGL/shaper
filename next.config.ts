import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

// Initialize bundle analyzer conditionally
const withBundleAnalyzerExt = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: '/fitspace',
        destination: '/fitspace/dashboard',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1ahv5z4h61wkv.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fitspace-prod.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value:
              process.env.NODE_ENV === 'development'
                ? '*'
                : 'https://hypertro.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },
  turbopack: {
    rules: {
      '*.graphql': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  devIndicators:
    process.env.NEXT_PUBLIC_DEVTOOLS === 'true'
      ? {
          position: 'top-left',
        }
      : false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })

    return config
  },
}

// Wrap the config with bundle analyzer
export default withBundleAnalyzerExt(nextConfig)
