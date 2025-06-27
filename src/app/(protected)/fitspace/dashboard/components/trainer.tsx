import { MessageCircle } from 'lucide-react'

import { RatingStars } from '@/components/rating-stars'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/user-avatar'
import { GQLFitspaceDashboardQuery } from '@/generated/graphql-client'

import { NoTrainerCard } from './no-trainer-card'

type TrainerProps = {
  trainer: GQLFitspaceDashboardQuery['myTrainer']
}

export function Trainer({ trainer }: TrainerProps) {
  if (!trainer) {
    return <NoTrainerCard />
  }

  return <TrainerCard trainer={trainer} />
}

type TrainerCardProps = {
  trainer: NonNullable<GQLFitspaceDashboardQuery['myTrainer']>
}

function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar
            imageUrl={trainer.image}
            firstName={trainer.firstName ?? ''}
            lastName={trainer.lastName ?? ''}
            sex={trainer.sex}
            className="size-14"
          />
          <div className="flex-1">
            <h3 className="font-semibold">
              {trainer.firstName} {trainer.lastName}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {typeof trainer.averageRating === 'number' && (
                <RatingStars rating={trainer.averageRating} showValue />
              )}
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span className="text-sm text-muted-foreground">
                {trainer.yearsOfExperience}+ years exp
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Your Trainer
            </Badge>
          </div>
          <Button
            size="icon-lg"
            className="shrink-0 ml-auto"
            iconOnly={<MessageCircle />}
          />
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Latest trainer message
        </p>
        <div className="bg-input/50 rounded-lg p-3 mt-2">
          <p className="text-sm text-muted-foreground">
            "Great progress this week! Focus on form over weight today. You've
            got this! 💪"
          </p>
          <span className="text-xs text-muted-foreground">2 hours ago</span>
        </div>
      </CardContent>
    </Card>
  )
}
