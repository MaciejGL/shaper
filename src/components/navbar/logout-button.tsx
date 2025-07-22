'use client'

import { useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'

export const LogoutButton = () => {
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      // Clear all query cache before logout to prevent stale data issues
      queryClient.clear()

      // Force logout with no cache and redirect
      await signOut({
        callbackUrl: '/login',
        redirect: true,
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force page reload to clear all state
      window.location.href = '/login'
    }
  }

  return (
    <button onClick={handleLogout} className="cursor-pointer">
      Logout
    </button>
  )
}
