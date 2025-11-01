export const isProd =
  process.env.VERCEL_ENV === 'production' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Running on the client — use window origin
    return window.location.origin
  }

  if (isProd) {
    return 'https://www.hypro.app'
  }

  // Running on the server — use production URL or fallback
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:4000'
}
