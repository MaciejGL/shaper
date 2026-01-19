'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback } from './ui/avatar'

export const UserAvatar = ({
  imageUrl,
  firstName,
  lastName,
  sex,
  withFallbackAvatar = true,
  className,
}: {
  imageUrl?: string | null
  firstName: string
  lastName: string
  sex?: string | null
  withFallbackAvatar?: boolean
  className?: string
}) => {
  const [isImageError, setIsImageError] = useState(false)

  // Determine the gender-based fallback image
  let fallbackImage = null
  if (sex?.toLowerCase() === 'female') {
    fallbackImage = '/avatar-female.png'
  } else if (sex?.toLowerCase() === 'male') {
    fallbackImage = '/avatar-male.png'
  }

  const fallbackInitials = firstName.charAt(0) + lastName.charAt(0)

  // Determine which image to display (custom image has priority over gender-based avatar)
  const displayImage = imageUrl || (withFallbackAvatar ? fallbackImage : null)
  const shouldShowImage = Boolean(displayImage) && !isImageError

  return (
    <Avatar className={cn('size-20 aspect-square', className)}>
      {shouldShowImage && displayImage && (
        <Image
          src={displayImage}
          alt={`${firstName} ${lastName}`}
          width={80}
          height={80}
          quality={70}
          className="aspect-square size-full object-cover"
          onError={() => setIsImageError(true)}
        />
      )}
      <AvatarFallback
        className={cn(
          'text-xs text-sidebar-foreground',
          className,
          shouldShowImage && 'hidden',
        )}
      >
        {fallbackInitials}
      </AvatarFallback>
    </Avatar>
  )
}
