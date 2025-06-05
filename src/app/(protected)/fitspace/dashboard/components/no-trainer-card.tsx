import { ArrowRight, BookOpen, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'

export function NoTrainerCard() {
  return (
    <Card className="overflow-hidden border-primary/20" variant="gradient">
      <CardContent>
        {/* Header */}
        <div className="mb-6 lg:mb-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            Elevate Your Fitness Journey
          </h3>
          <p className="text-muted-foreground">
            Get personalized guidance from expert trainers to reach your goals
            faster
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 mb-6 lg:grid-cols-2 lg:gap-6">
          <Link href="/fitspace/marketplace?tab=trainers">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/80">
              <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Expert Trainers</div>
                <div className="text-sm text-muted-foreground">
                  Certified professionals with proven results
                </div>
              </div>
              <ArrowRight className="self-center ml-auto" />
            </div>
          </Link>
          <Link href="/fitspace/marketplace?tab=plans">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/80">
              <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Custom Plans</div>
                <div className="text-sm text-muted-foreground">
                  Workouts tailored to your goals and schedule
                </div>
              </div>
              <ArrowRight className="self-center ml-auto" />
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
