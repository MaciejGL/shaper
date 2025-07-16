'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, XIcon } from 'lucide-react'
import { PenIcon } from 'lucide-react'

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
    <div className="container max-w-3xl mx-auto mb-16 relative pb-16">
      <div className="sticky top-[16px] right-0 z-10 flex justify-end">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="edit-button"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={toggleEdit}
                iconOnly={<PenIcon />}
                variant="secondary"
              >
                Edit
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="save-button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-2">
                <Button
                  onClick={toggleEdit}
                  variant="secondary"
                  size="icon-md"
                  disabled={isSaving}
                >
                  <XIcon />
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  iconOnly={<CheckIcon />}
                >
                  Save changes
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Header
        profile={profile}
        isEditing={isEditing}
        onAvatarChange={(avatarUrl) => handleChange('avatarUrl', avatarUrl)}
      />

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

      <Bio
        isEditing={isEditing}
        profile={profile}
        handleChange={handleChange}
      />
    </div>
  )
}
