'use client'

import { signOut } from 'next-auth/react'

export const LogoutButton = () => {
  const handleLogout = async () => {
    // Explicitly redirect to login page after logout
    await signOut({
      callbackUrl: '/login',
      redirect: true,
    })
  }
  return (
    <button onClick={() => handleLogout()} className="cursor-pointer">
      Logout
    </button>
  )
}
