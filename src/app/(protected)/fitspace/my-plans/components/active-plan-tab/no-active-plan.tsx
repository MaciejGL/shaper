import { ListMinus } from 'lucide-react'
import { Target } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { BiggyIcon } from '@/components/biggy-icon'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Card } from '@/components/ui/card'

import { PlanTab } from '../../types'

export function NoActivePlan() {
  const [, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<PlanTab>([
      PlanTab.Active,
      PlanTab.Available,
      PlanTab.Completed,
    ]),
  )
  return (
    <Card variant="gradient">
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <BiggyIcon icon={Target} />
        <h3 className="font-semibold mb-2 mt-6">No Active Plans</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any active training plans
        </p>

        <div className="flex justify-center gap-2">
          <Button
            iconStart={<ListMinus />}
            onClick={() => setTab(PlanTab.Available)}
          >
            Check Your Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
