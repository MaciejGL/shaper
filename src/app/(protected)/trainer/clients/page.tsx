'use client'

import { Users2Icon } from 'lucide-react'
import { useState } from 'react'

import { BirthdayCelebration } from '@/components/birthday-celebration/birthday-celebration'
import {
  dismissCelebration,
  shouldShowCelebration,
} from '@/components/birthday-celebration/utils'
import { useUser } from '@/context/user-context'

import { DashboardHeader } from '../components/dashboard-header'

import { ClientsFilter } from './components/clients-filter'
import { ClientsTabs } from './components/clients-tabs'

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
    <div className="container mx-auto">
      <DashboardHeader
        title="Clients"
        description="Manage your clients, track their progress, and schedule sessions."
        icon={Users2Icon}
      />
      <div className="space-y-6">
        <ClientsFilter />
        <ClientsTabs />
      </div>
      {showCelebration && <BirthdayCelebration onDismiss={handleDismiss} />}
    </div>
  )
}
