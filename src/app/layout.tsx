import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'

import Providers from '@/components/providers'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'block',
  preload: true,
})

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  display: 'block',
  preload: true,
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Fitspace',
  description: 'The best way to get fit and find new friends.',
  icons: {
    icon: [
      {
        url: '/favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/favicons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon.ico', type: 'image/x-icon' },
      { url: '/favicons/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitspace',
    description: 'Your personal fitness coach',
    images: ['/favicons/android-chrome-192x192.png'],
  },
  openGraph: {
    title: 'Fitspace',
    description: 'Your personal fitness coach',
    images: ['/favicons/android-chrome-192x192.png'],
  },
  alternates: {
    canonical: 'https://fit-space.app',
  },
  metadataBase: new URL('https://fit-space.app'),
  applicationName: 'Fitspace',
  appleWebApp: {
    title: 'Fitspace',
    statusBarStyle: 'black-translucent',
    capable: true,
    startupImage: ['/favicons/apple-touch-icon.png'],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Explicit manifest link for better PWA support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${inter.variable} ${interTight.variable} antialiased min-h-svh`}
      >
        {isDevelopment && (
          <div className="fixed top-0 left-0 size-2 rounded-full bg-red-500 z-50"></div>
        )}
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
                  
                  if (isLocalhost) {
                    // Clear old caches in development to avoid manifest caching issues
                    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
                    if (window.caches) {
                      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
                    }
                    
                    // Register SW after clearing
                    setTimeout(() => {
                      navigator.serviceWorker.register('/sw.js').catch((err) => {
                        console.log('SW registration failed: ', err);
                      });
                    }, 100);
                  } else {
                    navigator.serviceWorker.register('/sw.js').catch((err) => {
                      console.log('SW registration failed: ', err);
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
