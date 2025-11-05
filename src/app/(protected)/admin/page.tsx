'use client'

import {
  Bell,
  Calendar,
  Cloud,
  CreditCard,
  Dumbbell,
  UserCheck,
  Users,
} from 'lucide-react'
import { parseAsStringEnum } from 'nuqs'
import { useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  LazyAwsTab as AwsTab,
  LazyExercisesTab as ExercisesTab,
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
      | 'exercises'
      | 'push'
      | 'stripe'
      | 'aws'
    >(['users', 'trainers', 'plans', 'exercises', 'push', 'stripe', 'aws'])
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
              | 'exercises'
              | 'push'
              | 'stripe'
              | 'aws',
          )
        }
      >
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="trainers">
            <UserCheck className="h-4 w-4" />
            Trainers
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Calendar className="h-4 w-4" />
            Training Plans
          </TabsTrigger>
          <TabsTrigger value="stripe">
            <CreditCard className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <Dumbbell className="h-4 w-4" />
            Exercise Management
          </TabsTrigger>

          <TabsTrigger value="push">
            <Bell className="h-4 w-4" />
            Push Notifications
          </TabsTrigger>
          <TabsTrigger value="aws">
            <Cloud className="h-4 w-4" />
            AWS Storage
          </TabsTrigger>
          {/* Future tabs can be added here */}
          {/* <TabsTrigger value="database">Database</TabsTrigger> */}
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

        <TabsContent value="stripe" className="mt-6">
          <StripeTab />
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          <ExercisesTab />
        </TabsContent>

        <TabsContent value="push" className="mt-6">
          <PushNotificationsTab />
        </TabsContent>

        <TabsContent value="aws" className="mt-6">
          <AwsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
