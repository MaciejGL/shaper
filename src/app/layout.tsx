import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'

import Providers from '@/components/providers'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Hypro',
  description: 'Your personal fitness coach.',
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
    title: 'Hypro',
    description: 'Your personal fitness coach',
    images: ['/favicons/android-chrome-192x192.png'],
  },
  openGraph: {
    title: 'Hypro',
    description: 'Your personal fitness coach',
    images: ['/favicons/android-chrome-192x192.png'],
  },
  alternates: {
    canonical: 'https://hypro.app',
  },
  metadataBase: new URL('https://hypro.app'),
  applicationName: 'Hypro',
  appleWebApp: {
    title: 'Hypro',
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
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* Google Identity Services for One Tap */}
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-svh`}
      >
        {isDevelopment && (
          <div className="fixed top-0 left-0 size-2 rounded-full bg-red-500 z-50"></div>
        )}

        <Providers>{children}</Providers>

        {/* Service Worker Registration - LogRocket best practice */}
        <ServiceWorkerRegistration />
        <SpeedInsights />
      </body>
    </html>
  )
}
