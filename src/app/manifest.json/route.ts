import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    name: 'Fitspace - Fitness & Nutrition Tracker',
    short_name: 'Fitspace',
    description: 'Your personal fitness and nutrition tracking app',
    start_url: '/fitspace',
    id: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['health', 'fitness', 'lifestyle'],
    lang: 'en',
    prefer_related_applications: false,
    icons: [
      // Regular icons for app launcher (any purpose)
      {
        src: '/favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable icons for adaptive icons (Android)
      {
        src: '/favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Log Workout',
        short_name: 'Workout',
        description: 'Quick access to log your workout',
        url: '/fitspace/workouts',
        icons: [
          {
            src: '/favicons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, immutable',
    },
  })
}
