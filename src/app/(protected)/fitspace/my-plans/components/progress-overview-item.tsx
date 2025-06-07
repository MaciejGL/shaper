export function ProgressOverviewItem({
  value,
  label,
}: {
  value: number | string
  label: string
}) {
  return (
    <div className="text-center p-3 bg-white dark:bg-background rounded-lg shadow-md">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
