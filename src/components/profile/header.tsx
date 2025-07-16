import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/avatar-upload'

import { Profile } from './types'

type HeaderProps = {
  profile: Pick<Profile, 'firstName' | 'lastName' | 'avatarUrl' | 'sex'>
  isEditing: boolean
  onAvatarChange: (avatarUrl: string) => void
}

export function Header({ profile, isEditing, onAvatarChange }: HeaderProps) {
  const handleAvatarUpload = (imageUrl: string) => {
    onAvatarChange(imageUrl)
  }

  const handleAvatarRemove = () => {
    onAvatarChange('')
  }

  return (
    <div className="mx-auto">
      <div className="flex flex-col items-center mb-6 md:flex-row md:items-start md:gap-6">
        <div className="relative mb-4 md:mb-0">
          {isEditing ? (
            <AvatarUpload
              currentImageUrl={profile?.avatarUrl || undefined}
              fallbackUrl={getAvatarUrl(profile?.sex) || undefined}
              onImageUploaded={handleAvatarUpload}
              onImageRemoved={handleAvatarRemove}
              showRemoveButton={true}
              alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
            />
          ) : (
            <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-800 shadow-xs bg-zinc-100 dark:bg-zinc-700 shadow-zinc-200 dark:shadow-black">
              <AvatarImage
                src={profile?.avatarUrl || getAvatarUrl(profile?.sex) || ''}
                alt={`${profile?.firstName} ${profile?.lastName}`}
              />
            </Avatar>
          )}
        </div>

        {profile?.firstName && profile?.lastName && (
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
          </div>
        )}
      </div>
    </div>
  )
}

const getAvatarUrl = (sex?: string | null) => {
  if (!sex) return null
  if (sex.toLowerCase() === 'male') return '/avatar-male.png'
  if (sex.toLowerCase() === 'female') return '/avatar-female.png'
  return null
}
