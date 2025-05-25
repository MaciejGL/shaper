import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Fitspace',
  description: 'The best way to get fit and find new friends.',
  icons: {
    icon: '/icons/logo-bg-dark.svg',
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
      </body>
    </html>
  )
}
