import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

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

  return (
    <Avatar className={cn('size-20 aspect-square', className)}>
      {displayImage && <AvatarImage src={displayImage} />}
      <AvatarFallback className={cn('text-xs', className)}>
        {fallbackInitials}
      </AvatarFallback>
    </Avatar>
  )
}
