import { AnimateNumber } from './animate-number'

export function StatsItem({
  value,
  icon,
  label,
}: {
  value: number | string | React.ReactNode
  icon?: React.ReactNode
  label: string
}) {
  return (
    <div className="text-center p-3 bg-white dark:bg-background rounded-lg shadow-md">
      {icon ? (
        <div className="flex items-center gap-2">
          <div>{icon}</div>
          <div className="flex flex-col items-start">
            {typeof value === 'number' ? (
              <div className="text-lg text-left font-bold text-primary">
                <AnimateNumber value={value} />
              </div>
            ) : typeof value === 'string' ? (
              <div className="text-lg text-left font-bold text-primary">
                {value}
              </div>
            ) : (
              <div className="text-lg text-left font-bold text-primary">
                {value}
              </div>
            )}
            <div className="text-xs text-left text-muted-foreground">
              {label}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-lg font-bold text-primary">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </>
      )}
    </div>
  )
}
