import { CollapsibleText } from '@/components/collapsible-text'

interface DescriptionSectionProps {
  description?: string | null
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  if (!description) return null

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm">Description</h3>
      <CollapsibleText text={description} maxWords={80} />
    </div>
  )
}
