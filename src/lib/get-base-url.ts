export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Running on the client — safe to use window
    return window.location.origin
  }

  // Running on the server
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL // ✅ Preferred
  }

  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}` // ✅ Safe fallback for preview
  }

  return 'http://localhost:4000' // dev fallback
}

export const isProd =
  process.env.VERCEL_ENV === 'production' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
