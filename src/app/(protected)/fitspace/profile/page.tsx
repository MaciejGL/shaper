'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Bio } from '@/components/profile/bio'
import { GoalsAndHealth } from '@/components/profile/goals-and-health'
import { Header } from '@/components/profile/header'
import { PersonalInfo } from '@/components/profile/personal-info'
import { PhysicalStats } from '@/components/profile/physical-stats'
import { useProfile } from '@/components/profile/use-profile.hook'

export default function ProfilePage() {
  const {
    profile,
    handleChange,
    handleSectionSave,
    toggleSectionEdit,
    isSectionEditing,
    isSaving,
  } = useProfile()

  return (
    <AnimatedPageTransition id="profile">
      <div className="container-hypertro mx-auto pt-8">
        <Header
          profile={profile}
          onAvatarChange={(avatarUrl) => handleChange('avatarUrl', avatarUrl)}
        />

        <PersonalInfo
          profile={profile}
          handleChange={handleChange}
          isSectionEditing={isSectionEditing('personalInfo')}
          onToggleEdit={() => toggleSectionEdit('personalInfo')}
          onSave={() => handleSectionSave('personalInfo')}
          isSaving={isSaving}
        />

        <PhysicalStats
          profile={profile}
          handleChange={handleChange}
          isSectionEditing={isSectionEditing('physicalStats')}
          onToggleEdit={() => toggleSectionEdit('physicalStats')}
          onSave={() => handleSectionSave('physicalStats')}
          isSaving={isSaving}
        />

        <GoalsAndHealth
          profile={profile}
          handleChange={handleChange}
          isSectionEditing={isSectionEditing('goalsAndHealth')}
          onToggleEdit={() => toggleSectionEdit('goalsAndHealth')}
          onSave={() => handleSectionSave('goalsAndHealth')}
          isSaving={isSaving}
        />

        <Bio
          profile={profile}
          handleChange={handleChange}
          isSectionEditing={isSectionEditing('bio')}
          onToggleEdit={() => toggleSectionEdit('bio')}
          onSave={() => handleSectionSave('bio')}
          isSaving={isSaving}
        />
      </div>
    </AnimatedPageTransition>
  )
}
