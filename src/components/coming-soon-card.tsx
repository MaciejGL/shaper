import { Clock } from 'lucide-react'

import { BiggyIcon } from './biggy-icon'
import { Card } from './ui/card'

interface ComingSoonCardProps {
  title?: string
  description?: string
  icon?: React.ElementType
}

export function ComingSoonCard({
  title = 'Coming Soon',
  description = 'This feature is currently not available in your region. Stay tuned for updates.',
  icon = Clock,
}: ComingSoonCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <BiggyIcon icon={icon} variant="default" />
        <div className="text-lg font-medium mb-2 mt-4">{title}</div>
        <div className="text-muted-foreground text-center max-w-[35ch] text-sm">
          {description}
        </div>
      </div>
    </Card>
  )
}
