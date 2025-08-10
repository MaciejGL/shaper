'use client'

import { Calendar, Compass, Users } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { TrainersTab } from './components/trainers-tab'
import { TrainingPlansTab } from './components/training-plans-tab'

export default function ExplorePage() {
  return (
    <div className="container-hypertro mx-auto mb-24 max-w-md">
      <DashboardHeader title="Explore" icon={Compass} />

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">
            <Calendar className="h-4 w-4 mr-2" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="trainers">
            <Users className="h-4 w-4 mr-2" />
            Trainers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <TrainingPlansTab />
        </TabsContent>

        <TabsContent value="trainers" className="mt-6">
          <TrainersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
