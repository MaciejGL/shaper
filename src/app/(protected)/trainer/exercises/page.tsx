'use client'

import { useQueryState } from 'nuqs'
import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { useMuscleGroupCategoriesQuery } from '@/generated/graphql-client'

import { CreateExerciseDialog } from './components/create-exercise-dialog'
import { ExerciseSearch } from './components/exercise-search'
import { ExerciseTabContent } from './components/exercise-tab-content'
import { Header } from './components/header'

export default function TrainerExercisesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useQueryState('equipment', {
    defaultValue: 'all',
    shallow: true,
    clearOnDefault: true,
  })

  const { data: muscleGroupCategories } = useMuscleGroupCategoriesQuery()

  const categories = muscleGroupCategories?.muscleGroupCategories

  return (
    <div className="container @container/section mx-auto p-6 space-y-6">
      <Header setIsCreateDialogOpen={setIsCreateDialogOpen} />

      <ExerciseSearch />

      <Tabs defaultValue="all">
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.slug}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <Select
            value={selectedEquipment}
            onValueChange={setSelectedEquipment}
          >
            <SelectTrigger className="min-w-48">
              <SelectValue placeholder="Equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {EQUIPMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TabsContent value="all">
          <ExerciseTabContent
            categoryId="all"
            setIsCreateDialogOpen={setIsCreateDialogOpen}
          />
        </TabsContent>
        {categories?.map((category) => (
          <TabsContent key={category.id} value={category.slug}>
            <ExerciseTabContent
              categoryId={category.id}
              categories={categories}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
            />
          </TabsContent>
        ))}
      </Tabs>

      <CreateExerciseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
      />
    </div>
  )
}
