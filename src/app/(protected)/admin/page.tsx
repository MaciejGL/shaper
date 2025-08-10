import { Bell, Cloud, Dumbbell, UserCheck, Users, Utensils } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AwsTab } from './components/aws-tab'
import { ExercisesTab } from './components/exercises-tab'
import { FoodsTab } from './components/foods-tab'
import { PushNotificationsTab } from './components/push-notifications-tab'
import { TrainersTab } from './components/trainers-tab'
import { UsersTab } from './components/users-tab'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Admin Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="trainers">
            <UserCheck className="h-4 w-4" />
            Trainers
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <Dumbbell className="h-4 w-4" />
            Exercise Management
          </TabsTrigger>
          <TabsTrigger value="foods">
            <Utensils className="h-4 w-4" />
            Food Management
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

        <TabsContent value="exercises" className="mt-6">
          <ExercisesTab />
        </TabsContent>

        <TabsContent value="foods" className="mt-6">
          <FoodsTab />
        </TabsContent>

        <TabsContent value="push" className="mt-6">
          <PushNotificationsTab />
        </TabsContent>

        <TabsContent value="aws" className="mt-6">
          <AwsTab />
        </TabsContent>

        {/* Future tab contents can be added here */}
        {/* <TabsContent value="database">
          <DatabaseTab />
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
