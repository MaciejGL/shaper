interface HeaderTabProps {
  title: string | React.ReactNode
  description: string
}

export function HeaderTab({ title, description }: HeaderTabProps) {
  return (
    <div className="space-y-1 mb-6 mt-2">
      <div className="text-2xl font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  )
}
