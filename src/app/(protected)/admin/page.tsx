'use client'

import {
  Bell,
  Calendar,
  Cloud,
  CreditCard,
  Dumbbell,
  Flame,
  Globe,
  Mail,
  UserCheck,
  Users,
} from 'lucide-react'
import { parseAsStringEnum } from 'nuqs'
import { useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  LazyAwsTab as AwsTab,
  LazyEmailLogsTab as EmailLogsTab,
  LazyExercisesTab as ExercisesTab,
  LazyExternalOffersTab as ExternalOffersTab,
  LazyFreeWorkoutDaysAdmin as FreeWorkoutDaysAdmin,
  LazyPushNotificationsTab as PushNotificationsTab,
  LazyStripeTab as StripeTab,
  LazyTrainersTab as TrainersTab,
  LazyTrainingPlansTab as TrainingPlansTab,
  LazyUsersTab as UsersTab,
} from './components/lazy-admin-tabs'

export default function AdminPage() {
  // Use nuqs for tab persistence
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum<
      | 'users'
      | 'trainers'
      | 'plans'
      | 'free-workouts'
      | 'exercises'
      | 'push'
      | 'stripe'
      | 'external'
      | 'aws'
      | 'email-logs'
    >([
      'users',
      'trainers',
      'plans',
      'free-workouts',
      'exercises',
      'push',
      'stripe',
      'external',
      'aws',
      'email-logs',
    ])
      .withDefault('users')
      .withOptions({ clearOnDefault: true }),
  )

  return (
    <div className="space-y-6">
      {/* Admin Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(
            value as
              | 'users'
              | 'trainers'
              | 'plans'
              | 'free-workouts'
              | 'exercises'
              | 'push'
              | 'stripe'
              | 'external'
              | 'aws',
          )
        }
      >
        <TabsList
          variant="secondary"
          className="w-full flex-wrap h-auto justify-start gap-1"
        >
          <TabsTrigger value="users" className="flex-none">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="trainers" className="flex-none">
            <UserCheck className="h-4 w-4" />
            Trainers
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-none">
            <Calendar className="h-4 w-4" />
            Training Plans
          </TabsTrigger>
          <TabsTrigger value="free-workouts" className="flex-none">
            <Flame className="h-4 w-4" />
            Free Workouts
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex-none">
            <CreditCard className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex-none">
            <Dumbbell className="h-4 w-4" />
            Exercise Management
          </TabsTrigger>

          <TabsTrigger value="push" className="flex-none">
            <Bell className="h-4 w-4" />
            Push Notifications
          </TabsTrigger>
          <TabsTrigger value="external" className="flex-none">
            <Globe className="h-4 w-4" />
            External Offers
          </TabsTrigger>
          <TabsTrigger value="aws" className="flex-none">
            <Cloud className="h-4 w-4" />
            AWS Storage
          </TabsTrigger>
          <TabsTrigger value="email-logs" className="flex-none">
            <Mail className="h-4 w-4" />
            Email Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>

        <TabsContent value="trainers" className="mt-6">
          <TrainersTab />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <TrainingPlansTab />
        </TabsContent>

        <TabsContent value="free-workouts" className="mt-6">
          <FreeWorkoutDaysAdmin />
        </TabsContent>

        <TabsContent value="stripe" className="mt-6">
          <StripeTab />
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          <ExercisesTab />
        </TabsContent>

        <TabsContent value="push" className="mt-6">
          <PushNotificationsTab />
        </TabsContent>

        <TabsContent value="external" className="mt-6">
          <ExternalOffersTab />
        </TabsContent>

        <TabsContent value="aws" className="mt-6">
          <AwsTab />
        </TabsContent>

        <TabsContent value="email-logs" className="mt-6">
          <EmailLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
