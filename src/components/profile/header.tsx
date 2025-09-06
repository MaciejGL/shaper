import { AvatarUpload } from '@/components/ui/avatar-upload'

import { Profile } from './types'

type HeaderProps = {
  profile: Pick<
    Profile,
    'firstName' | 'lastName' | 'avatarUrl' | 'sex' | 'email'
  >
  onAvatarChange: (avatarUrl: string) => void
}

export function Header({ profile, onAvatarChange }: HeaderProps) {
  const handleAvatarUpload = (imageUrl: string) => {
    onAvatarChange(imageUrl)
  }

  const handleAvatarRemove = () => {
    onAvatarChange('')
  }

  return (
    <div className="mx-auto">
      <div className="flex flex-col items-center mb-6 md:flex-row md:justify-center md:gap-6 relative">
        <div className="relative mb-4 md:mb-0">
          <AvatarUpload
            currentImageUrl={profile?.avatarUrl || undefined}
            fallbackUrl={getAvatarUrl(profile?.sex) || undefined}
            onImageUploaded={handleAvatarUpload}
            onImageRemoved={handleAvatarRemove}
            alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
          />
        </div>

        {profile?.firstName && profile?.lastName && (
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const getAvatarUrl = (sex?: string | null) => {
  if (!sex) return null
  if (sex.toLowerCase() === 'male') return '/avatar-male.png'
  if (sex.toLowerCase() === 'female') return '/avatar-female.png'
  return null
}
