import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'

type CallToActionProps = {
  plan: GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById']
}
export function CallToAction({ plan }: CallToActionProps) {
  const handlePurchaseTrainingPlan = () => {
    // TODO: Implement purchase training plan
    console.warn('purchase training plan')
  }

  if (plan.assignedTo?.id) {
    return null
  }

  return (
    <Card className="bg-primary dark:bg-primary text-primary-foreground">
      <CardContent className="p-6 text-center">
        <h3 className="font-semibold mb-2">Ready to Start?</h3>
        <p className="text-sm opacity-90 mb-4">
          Transform your physique and achieve your fitness goals with this
          program.
        </p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handlePurchaseTrainingPlan}
        >
          Start Training Now
        </Button>
      </CardContent>
    </Card>
  )
}
