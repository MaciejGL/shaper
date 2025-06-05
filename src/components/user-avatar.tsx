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
  let fallbackImage = null
  if (sex?.toLowerCase() === 'female') {
    fallbackImage = '/avatar-female.png'
  }
  if (sex?.toLowerCase() === 'male') {
    fallbackImage = '/avatar-male.png'
  }

  const fallbackInitials = firstName.charAt(0) + lastName.charAt(0)
  return (
    <Avatar className={cn('size-20 aspect-square', className)}>
      {imageUrl ? (
        <AvatarImage src={imageUrl ?? fallbackImage} />
      ) : withFallbackAvatar && fallbackImage ? (
        <AvatarImage src={fallbackImage} />
      ) : null}
      <AvatarFallback>{fallbackInitials}</AvatarFallback>
    </Avatar>
  )
}
