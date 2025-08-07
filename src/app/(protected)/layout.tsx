import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/context/user-context'
import { UserPreferencesProvider } from '@/context/user-preferences-context'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
