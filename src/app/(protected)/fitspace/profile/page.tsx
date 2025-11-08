'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Bio } from '@/components/profile/bio'
import { GoalsAndHealth } from '@/components/profile/goals-and-health'
import { Header } from '@/components/profile/header'
import { PersonalInfo } from '@/components/profile/personal-info'
import { PhysicalStats } from '@/components/profile/physical-stats'
import { useAutoSaveProfile } from '@/components/profile/use-auto-save-profile.hook'
import { useProfile } from '@/components/profile/use-profile.hook'

export default function ProfilePage() {
  const { profile, handleAutoSave } = useAutoSaveProfile()
  const { handleAvatarChange } = useProfile()

  if (!profile) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton count={3} variant="lg" />
      </div>
    )
  }

  return (
    <AnimatedPageTransition id="profile">
      <div className="container-hypertro mx-auto pt-8">
        <Header profile={profile} onAvatarChange={handleAvatarChange} />

        <PersonalInfo profile={profile} handleChange={handleAutoSave} />

        <PhysicalStats profile={profile} handleChange={handleAutoSave} />

        <GoalsAndHealth profile={profile} handleChange={handleAutoSave} />

        <Bio profile={profile} handleChange={handleAutoSave} />
      </div>
    </AnimatedPageTransition>
  )
}
