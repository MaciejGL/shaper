'use client'

import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

type NavigationContextType = {
  previousPath: string | null
  currentPath: string
}

const NavigationContext = createContext<NavigationContextType>({
  previousPath: null,
  currentPath: '',
})

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [previousPath, setPreviousPath] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string>(pathname)

  useEffect(() => {
    setPreviousPath(currentPath)
    setCurrentPath(pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <NavigationContext.Provider value={{ previousPath, currentPath: pathname }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  return useContext(NavigationContext)
}
