import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'

import Providers from '@/components/providers'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} antialiased min-h-svh`}
      >
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
