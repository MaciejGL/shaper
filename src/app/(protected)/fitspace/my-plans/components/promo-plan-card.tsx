import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'

export function PromoPlanCard() {
  return (
    <Link href="/fitspace/explore?tab=premium-plans" className="block">
      <Card
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
    </Link>
  )
}
