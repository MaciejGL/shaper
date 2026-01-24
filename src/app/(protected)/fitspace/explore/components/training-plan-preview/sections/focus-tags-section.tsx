import { focusTagLabels } from '@/components/training-plan/training-plan-filters'
import { Badge } from '@/components/ui/badge'
import { GQLFocusTag } from '@/generated/graphql-client'

interface FocusTagsSectionProps {
  focusTags: string[]
}

export function FocusTagsSection({ focusTags }: FocusTagsSectionProps) {
  if (!focusTags || focusTags.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-2 text-base">Training Focus</h3>
      <div className="flex flex-wrap gap-1">
        {focusTags.map((tag: string, index: number) => (
          <Badge
            key={index}
            size="md-lg"
            variant="primary"
            className="capitalize"
          >
            {focusTagLabels[tag as GQLFocusTag] || tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
