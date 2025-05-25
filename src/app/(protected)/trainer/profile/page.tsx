'use client'

import { CheckIcon, XIcon } from 'lucide-react'
import { PenIcon } from 'lucide-react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Bio } from '@/components/profile/bio'
import { GoalsAndHealth } from '@/components/profile/goals-and-health'
import { Header } from '@/components/profile/header'
import { PersonalInfo } from '@/components/profile/personal-info'
import { PhysicalStats } from '@/components/profile/physical-stats'
import { useProfile } from '@/components/profile/use-profile.hook'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { profile, isEditing, handleChange, handleSave, toggleEdit, isSaving } =
    useProfile()

  return (
    <AnimatedPageTransition id="profile">
      <div className="container max-w-3xl mx-auto mb-16">
        <Header profile={profile} isEditing={isEditing} />
        <PersonalInfo
          isEditing={isEditing}
          profile={profile}
          handleChange={handleChange}
        />

        <PhysicalStats
          isEditing={isEditing}
          profile={profile}
          handleChange={handleChange}
        />

        <GoalsAndHealth
          isEditing={isEditing}
          profile={profile}
          handleChange={handleChange}
        />

        {/* Bio */}
        <Bio
          isEditing={isEditing}
          profile={profile}
          handleChange={handleChange}
        />

        {!isEditing ? (
          <Button onClick={toggleEdit} className="fixed bottom-4 right-4">
            <PenIcon /> Edit
          </Button>
        ) : (
          <div className="fixed bottom-4 right-4 flex gap-2">
            <Button
              onClick={toggleEdit}
              variant="outline"
              size="icon-md"
              disabled={isSaving}
            >
              <XIcon />
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <CheckIcon /> Save changes
            </Button>
          </div>
        )}
      </div>
    </AnimatedPageTransition>
  )
}
