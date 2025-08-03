import { LucideIcon } from 'lucide-react'

import { Card, CardContent } from './ui/card'

export function StateCard({
  title,
  description,
  Icon,
}: {
  title: string
  description: string
  Icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="text-center space-y-4 py-6">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
