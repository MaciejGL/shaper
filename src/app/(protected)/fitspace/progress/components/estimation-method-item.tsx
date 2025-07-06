import { Badge } from '@/components/ui/badge'

interface EstimationMethodItemProps {
  rank: number
  name: string
  accuracy: 'Most Accurate' | 'Good' | 'Least Accurate'
  requirements: string
  tip: string
}

export function EstimationMethodItem({
  rank,
  name,
  accuracy,
  requirements,
  tip,
}: EstimationMethodItemProps) {
  const getRankStyles = () => {
    switch (rank) {
      case 1:
        return 'text-green-800 dark:text-green-200'
      case 2:
        return 'text-yellow-800 dark:text-yellow-200'
      case 3:
        return 'text-red-800 dark:text-red-200'
      default:
        return 'text-gray-800 dark:text-gray-200'
    }
  }

  const getAccuracyStyles = () => {
    switch (accuracy) {
      case 'Most Accurate':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'Good':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'Least Accurate':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    }
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-between gap-2 w-full">
          <p className="text-sm font-medium">
            <span className={getRankStyles()}>
              {rank}. {name}
            </span>
          </p>
          <Badge variant="outline" className={getAccuracyStyles()}>
            {accuracy}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{requirements}</p>
      <p className="text-xs text-muted-foreground mt-1">{tip}</p>
    </div>
  )
}
