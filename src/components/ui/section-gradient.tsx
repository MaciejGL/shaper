import { cn } from '@/lib/utils'

export function SectionGradient({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Base darkness */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background opacity-95" />

      {/* Subtle accents */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/6 to-transparent opacity-30" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-500/5 to-transparent opacity-20" />

      {/* Ambient orbs (small accents) */}
      <div className="absolute -top-[30%] -left-[20%] size-[520px] bg-blue-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-[10%] -right-[20%] size-[520px] bg-purple-500/10 rounded-full blur-[140px]" />
    </div>
  )
}

