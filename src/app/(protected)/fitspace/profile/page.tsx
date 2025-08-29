'use client'

import { AnimatePresence, motion } from 'framer-motion'
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
      <div className="container-hypertro mx-auto pt-8">
        <Header
          profile={profile}
          isEditing={isEditing}
          onAvatarChange={(avatarUrl) => handleChange('avatarUrl', avatarUrl)}
        />

        <div className="flex justify-end mb-2 py-2">
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
                  iconStart={<PenIcon />}
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
                    disabled={isSaving}
                    iconStart={<XIcon />}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    iconStart={<CheckIcon />}
                  >
                    Save changes
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
    </AnimatedPageTransition>
  )
}
