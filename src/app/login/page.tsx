import { redirect } from 'next/navigation'
import React from 'react'

import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser } from '@/lib/getUser'

import { LoginCard } from './components/login-card'

export default async function RequestOtpPage() {
  const user = await getCurrentUser()

  if (user?.user.role) {
    const role = user.user.role
    if (role === GQLUserRole.Client) {
      redirect('/fitspace/dashboard')
    } else if (role === GQLUserRole.Trainer) {
      redirect('/trainer/dashboard')
    }
  }
  return (
    <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-gradient-to-b from-zinc-900 to-black">
      <LoginCard />
    </div>
  )
}
