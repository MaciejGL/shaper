import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'

import { PlanPreviewDay } from './plan-preview-day'

type PlanWeeks = NonNullable<
  NonNullable<
    GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['activePlan']
  >['weeks']
>

interface PlanPreviewTabProps {
  weeks?: PlanWeeks | null
  isTemplate?: boolean
}

export function PlanPreviewTab({
  weeks,
  isTemplate = false,
}: PlanPreviewTabProps) {
  if (!weeks || weeks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No workout schedule available for this plan.
        </p>
      </div>
    )
  }

  // Sort weeks by weekNumber
  const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber)

  return (
    <Accordion type="multiple" className="w-full" data-vaul-no-drag>
      {sortedWeeks.map((week) => {
        // Sort days by dayOfWeek
        const sortedDays = [...week.days].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek,
        )

        return (
          <AccordionItem key={week.id} value={`week-${week.id}`}>
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              Week {week.weekNumber}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {sortedDays.map((day) => (
                  <PlanPreviewDay
                    key={day.id}
                    day={day}
                    isTemplate={isTemplate}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
