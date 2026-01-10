import { ArrowDown, ArrowRight } from 'lucide-react'

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

interface NoActivePlanHeaderCardProps {
  onBrowsePlans?: () => void
}

export function NoActivePlanHeaderCard({
  onBrowsePlans,
}: NoActivePlanHeaderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active plan</CardTitle>
        <CardDescription>
          Start one of your plans below, or explore new programs tailored to
          your goals.
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter className="gap-2">
        {onBrowsePlans && (
          <Button
            onClick={onBrowsePlans}
            iconEnd={<ArrowDown />}
            variant="outline"
          >
            My Plans
          </Button>
        )}
        <ButtonLink
          href="/fitspace/explore?tab=plans"
          iconEnd={<ArrowRight />}
          className="flex-1"
        >
          {onBrowsePlans ? 'Explore New' : 'Find the Right Plan'}
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
