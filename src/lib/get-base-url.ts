export function getBaseUrl() {
	// This can be set for local development (http://einar.local:4000)
	// In production, this is set to the domain of the app
	if (process.env.NEXT_PUBLIC_URL) {
		return process.env.NEXT_PUBLIC_URL;
	}

	// If we are in Vercel, we can use the VERCEL_URL
	if (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL) {
		return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
	}

	return 'http://localhost:4000';
}

export const isProd =
	process.env.VERCEL_ENV === 'production' ||
	process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
