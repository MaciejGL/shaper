import { cn } from '@/lib/utils'

interface HyproTeamBadgeProps {
  className?: string
}

export function HyproTeamBadge({ className }: HyproTeamBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 text-[10px]  bg-linear-to-br from-cyan-500 to-cyan-600 rounded-full pl-1 pr-1.5 py-0.5',
        className,
      )}
      data-slot="hypro-team-badge"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4! text-white"
      >
        <path
          d="M6.45 16.875L5.025 14.475L2.325 13.875L2.5875 11.1L0.75 9L2.5875 6.9L2.325 4.125L5.025 3.525L6.45 1.125L9 2.2125L11.55 1.125L12.975 3.525L15.675 4.125L15.4125 6.9L17.25 9L15.4125 11.1L15.675 13.875L12.975 14.475L11.55 16.875L9 15.7875L6.45 16.875ZM8.2125 11.6625L12.45 7.425L11.4 6.3375L8.2125 9.525L6.6 7.95L5.55 9L8.2125 11.6625Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-bold text-white">Hypro Team</span>
    </div>
  )
}
