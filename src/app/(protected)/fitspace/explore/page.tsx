'use client'

import { Calendar, SearchIcon, Users } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { TrainersTab } from './components/trainers-tab'
import { TrainingPlansTab } from './components/training-plans-tab'

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const defaultValue = tabParam === 'trainers' ? 'trainers' : 'plans'

  return (
    <div className="container-hypertro mx-auto max-w-md">
      <DashboardHeader
        title="Discover"
        icon={SearchIcon}
        variant="indigo"
        className="mb-6"
      />

      <Tabs defaultValue={defaultValue} className="w-full">
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
