import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/context/user-context'
import { UserPreferencesProvider } from '@/context/user-preferences-context'
import { authOptions } from '@/lib/auth'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check
  const session = await getServerSession(authOptions)

  // Redirect unauthenticated users to login
  if (!session?.user?.email) {
    redirect('/login')
  }

  return (
    <UserProvider>
      <UserPreferencesProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </UserPreferencesProvider>
    </UserProvider>
  )
}
