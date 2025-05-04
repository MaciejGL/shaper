'use client'

import { signOut } from 'next-auth/react'

export const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut()
  }
  return (
    <button onClick={() => handleLogout()} className="cursor-pointer">
      Logout
    </button>
  )
}
