'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { ExtendHeader } from '@/components/extend-header'
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
      <ExtendHeader
        headerChildren={
          <div className="py-6 dark">
            <Header profile={profile} onAvatarChange={handleAvatarChange} />
          </div>
        }
      >
        <PersonalInfo profile={profile} handleChange={handleAutoSave} />

        <PhysicalStats profile={profile} handleChange={handleAutoSave} />

        <GoalsAndHealth profile={profile} handleChange={handleAutoSave} />

        <Bio profile={profile} handleChange={handleAutoSave} />
      </ExtendHeader>
    </AnimatedPageTransition>
  )
}
