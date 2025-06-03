'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMuscleGroupCategoriesQuery } from '@/generated/graphql-client'

import { CreateExerciseDialog } from './components/create-exercise-dialog'
import { ExerciseSearch } from './components/exercise-search'
import { ExerciseTabContent } from './components/exercise-tab-content'
import { Header } from './components/header'

export default function TrainerExercisesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: muscleGroupCategories } = useMuscleGroupCategoriesQuery()

  const categories = muscleGroupCategories?.muscleGroupCategories

  return (
    <div className="container @container/section">
      <Header setIsCreateDialogOpen={setIsCreateDialogOpen} />

      <div className="space-y-6">
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
          </div>
          <TabsContent value="all">
            <ExerciseTabContent
              categoryId="all"
              categories={categories}
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
    </div>
  )
}
