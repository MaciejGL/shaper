import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'

export function PromoPlanCard() {
  const router = useRouter()

  return (
    <Card
      onClick={() => router.push('/fitspace/explore?tab=premium-plans')}
      className="cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative aspect-video"
      variant="tertiary"
    >
      <CardContent className="relative flex gap-2 justify-between items-center h-full">
        <div className="flex flex-col items-center justify-center grow gap-6">
          <SectionIcon icon={ChevronRight} variant="indigo" size="lg" />
          <div className="space-y-1 text-center">
            <h3 className="text-lg font-semibold">Explore Plans</h3>
            <p className="text-sm text-muted-foreground">
              Browse structured programs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
