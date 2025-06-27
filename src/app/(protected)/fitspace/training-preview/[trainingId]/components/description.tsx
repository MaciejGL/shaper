import { CollapsibleText } from '@/components/collapsible-text'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'

type DescriptionProps = {
  plan: Pick<
    GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById'],
    'description'
  >
}

export function Description({ plan }: DescriptionProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Training Guidelines</h2>
      <div className="prose prose-sm max-w-none">
        <CollapsibleText text={plan.description} />
      </div>
    </div>
  )
}
