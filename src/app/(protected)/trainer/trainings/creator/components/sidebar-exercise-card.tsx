import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type SidebarExercsesCardProps = {
  name: string
  isPublic?: boolean
}

export function SidebarExercsesCard({
  name,
  isPublic,
}: SidebarExercsesCardProps) {
  return (
    <Card
      className="cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out"
      hoverable
    >
      <CardContent className="p-3 flex items-center justify-between">
        <p className="text-sm font-medium pr-6">{name}</p>
        {isPublic && (
          <Badge variant="outline">{isPublic ? 'Public' : 'Private'}</Badge>
        )}
      </CardContent>
    </Card>
  )
}
