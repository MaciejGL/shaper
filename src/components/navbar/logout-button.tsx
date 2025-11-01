'use client'

import { useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'

export const LogoutButton = () => {
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      // Clear query cache
      queryClient.clear()

      // Let NextAuth handle cookie clearing (it knows how)
      await signOut({
        callbackUrl: '/login',
        redirect: false, // We'll handle redirect manually
      })

      // Force full reload to clear WebView state
      window.location.replace('/login')
    } catch (error) {
      console.error('Logout error:', error)
      window.location.replace('/login')
    }
  }

  return (
    <button onClick={handleLogout} className="cursor-pointer">
      Logout
    </button>
  )
}
