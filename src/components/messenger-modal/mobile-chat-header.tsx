'use client'

import { ChevronLeft, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

interface MobileChatHeaderProps {
  partnerName: string
  partnerAvatar?: string
  partner?: {
    firstName?: string | null
    lastName?: string | null
  } | null
  isLoading: boolean
  onBack: () => void
  onClose: () => void
}

export function MobileChatHeader({
  partnerName,
  partnerAvatar,
  partner,
  isLoading,
  onBack,
  onClose,
}: MobileChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onBack}
        iconOnly={<ChevronLeft className="size-6!" />}
      />

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <UserAvatar
          withFallbackAvatar
          firstName={partner?.firstName || ''}
          lastName={partner?.lastName || ''}
          imageUrl={partnerAvatar}
          className="size-8"
        />
        <div className={cn('min-w-0', isLoading && 'masked-placeholder-text')}>
          <div className="text-base font-medium truncate">{partnerName}</div>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={onClose}
        iconOnly={<X />}
        className="ml-auto"
      />
    </div>
  )
}
