import Image from 'next/image'

import { Badge } from '@/components/ui/badge'

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

interface TrainingPlanHeroHeaderProps {
  title: string
  imageUrl: string | null
  difficulty?: Difficulty | null
  createdByName?: string | null
}

const difficultyVariantMap = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

export function TrainingPlanHeroHeader({
  title,
  imageUrl,
  difficulty,
  createdByName,
}: TrainingPlanHeroHeaderProps) {
  if (!imageUrl) return null

  return (
    <div className="flex-shrink-0 relative overflow-hidden dark">
      <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          quality={100}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute -inset-1 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          <div className="flex justify-between gap-1 text-white/80">
            {difficulty && (
              <Badge variant={difficultyVariantMap[difficulty]}>
                {difficulty}
              </Badge>
            )}
            {createdByName && (
              <span className="text-sm">by {createdByName}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

