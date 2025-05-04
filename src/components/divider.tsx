import { cn } from '@/lib/utils'

export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-b w-full my-4', className)} />
}
