import {
  Activity,
  ArrowRight,
  Calendar,
  MessageCircle,
  Target,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { CardContent } from '@/components/ui/card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export function QuickActions() {
  const hasTrainer = false

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 pt-2">
          {hasTrainer ? (
            <>
              <ButtonLink
                href="/fitspace/progress"
                variant="outline"
                className="w-full justify-start"
                size="sm"
                iconStart={<Target />}
                iconEnd={<ArrowRight />}
              >
                View Progress
              </ButtonLink>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                iconStart={<MessageCircle />}
              >
                Message Trainer
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                iconStart={<Calendar />}
              >
                Schedule Check-in
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                iconStart={<Target />}
              >
                Set Goals
              </Button>
              <ButtonLink
                href="/fitspace/sessions/quick-start"
                variant="outline"
                className="w-full justify-start"
                size="sm"
                iconStart={<Calendar />}
              >
                Quick Start Workout
              </ButtonLink>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                iconStart={<Activity />}
              >
                Track Weight
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
