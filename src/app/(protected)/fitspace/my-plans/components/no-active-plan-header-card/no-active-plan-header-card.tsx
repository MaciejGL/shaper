import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { AvailablePlan } from '../../types'
import { SelectPlanDrawer } from '../select-plan-drawer/select-plan-drawer'

interface NoActivePlanHeaderCardProps {
  availablePlans: AvailablePlan[]
  onSelectPlan: (plan: AvailablePlan) => void
}

export function NoActivePlanHeaderCard({
  availablePlans,
  onSelectPlan,
}: NoActivePlanHeaderCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const canSelectPlan = availablePlans.length > 0

  return (
    <>
      <Card variant="glass" className="shadow-md shadow-black">
        <CardHeader>
          <CardTitle>Activate full plan</CardTitle>
          <CardDescription>
            Pick one of the plans from our coaches or ask coach to make one only
            for You.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="gap-2">
          {canSelectPlan ? (
            <Button
              onClick={() => setIsDrawerOpen(true)}
              iconEnd={<ChevronRight />}
              className="w-full"
              size="lg"
            >
              Select plan to activate
            </Button>
          ) : (
            <ButtonLink
              href="/fitspace/explore?tab=plans"
              iconEnd={<ChevronRight />}
              className="flex-1"
              size="lg"
            >
              Find the Right Plan
            </ButtonLink>
          )}
        </CardFooter>
      </Card>

      <SelectPlanDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        plans={availablePlans}
        onSelectPlan={(plan) => {
          onSelectPlan(plan)
          setIsDrawerOpen(false)
        }}
      />
    </>
  )
}
