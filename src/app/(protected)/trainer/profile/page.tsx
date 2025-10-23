'use client'

import { Bell } from 'lucide-react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Header } from '@/components/profile/header'
import { PersonalInfo } from '@/components/profile/personal-info'
import { useAutoSaveProfile } from '@/components/profile/use-auto-save-profile.hook'
import { useProfile } from '@/components/profile/use-profile.hook'
import { PushNotificationSettings } from '@/components/settings/push-notification-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'

export default function ProfilePage() {
  const { profile, handleAutoSave } = useAutoSaveProfile()
  const { handleAvatarChange } = useProfile()

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <AnimatedPageTransition id="profile">
      <div className="container-hypertro mx-auto py-8">
        <Header profile={profile} onAvatarChange={handleAvatarChange} />

        <PersonalInfo profile={profile} handleChange={handleAutoSave} />

        <Card borderless>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SectionIcon size="sm" icon={Bell} variant="blue" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PushNotificationSettings />
          </CardContent>
        </Card>
      </div>
    </AnimatedPageTransition>
  )
}
