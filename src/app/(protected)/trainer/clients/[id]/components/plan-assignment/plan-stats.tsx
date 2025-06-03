import { Calendar, Clock, Target } from 'lucide-react'

type PlanStatsProps = {
  startDate?: string | null
  nextSession?: string | null
  progress?: number | null
}

export function PlanStats({
  startDate,
  nextSession,
  progress,
}: PlanStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <StatItem icon={<Calendar />} label="Start Date" value={startDate} />
        <StatItem icon={<Clock />} label="Next Session" value={nextSession} />
        <StatItem
          icon={<Target />}
          label="Progress"
          value={`${progress}% complete`}
        />
      </div>
      <ProgressBar progress={progress ?? 0} />
    </>
  )
}

type StatItemProps = {
  icon: React.ReactNode
  label: string
  value?: string | null
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{value ?? '-'}</p>
      </div>
    </div>
  )
}

type ProgressBarProps = {
  progress?: number | null
}

function ProgressBar({ progress = 0 }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Overall Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
