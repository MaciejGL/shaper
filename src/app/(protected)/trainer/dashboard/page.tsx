'use client'

import { LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

import { BirthdayCelebration } from '@/components/birthday-celebration/birthday-celebration'
import {
  dismissCelebration,
  shouldShowCelebration,
} from '@/components/birthday-celebration/utils'
import { useUser } from '@/context/user-context'

import { DashboardHeader } from '../components/dashboard-header'

export default function Page() {
  const { user } = useUser()
  const [showCelebration, setShowCelebration] = useState(() => {
    if (!user?.email) return false
    return shouldShowCelebration(user.email)
  })

  const handleDismiss = () => {
    dismissCelebration()
    setShowCelebration(false)
  }

  return (
    <div className="container h-full">
      <DashboardHeader title="Dashboard" icon={LayoutDashboard} />
      {true && <BirthdayCelebration onDismiss={handleDismiss} />}
    </div>
  )
}
