'use client'

import { GoBack } from '@/components/go-back'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'

import { CallToAction } from './call-to-action'
import { Description } from './description'
import { Header } from './header'
import { Overview } from './overview'
import { TargetMuscles } from './target-muscles'
import { Workouts } from './workouts'

export function TrainingOverview({
  plan,
}: {
  plan: NonNullable<GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById']>
}) {
  if (!plan) {
    return <div className="container mx-auto px-4 py-8">Plan not found</div>
  }

  const isDemo = plan.isDemo

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <GoBack />
      <Header plan={plan} isDemo={isDemo} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Overview */}
            <Overview plan={plan} />

            {/* Sample Workout */}
            <Workouts plan={plan} isDemo={isDemo} />
            <TargetMuscles plan={plan} />
            {/* Plan Description */}
            <Description plan={plan} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Muscles */}

            {/* CTA */}
            {!isDemo && <CallToAction plan={plan} />}
          </div>
        </div>
      </div>
    </div>
  )
}
