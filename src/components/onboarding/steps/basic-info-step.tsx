import { useRouter } from 'next/navigation'

import { DatePicker } from '@/components/date-picker'
import { RadioButtons } from '@/components/radio-buttons'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { OnboardingData } from '../onboarding-modal'

interface BasicInfoStepProps {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}

function getDefaultAvatarUrl(sex?: string): string | undefined {
  if (!sex) return undefined
  return `/avatar-${sex === 'male' ? 'male' : sex === 'female' ? 'female' : 'neutral'}.png`
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const router = useRouter()
  const handleAvatarUpload = (imageUrl: string) => {
    // Update onboarding data when upload completes
    onChange({ avatarUrl: imageUrl })
    router.refresh()
  }

  const handleAvatarRemove = () => {
    // Clear the avatar from onboarding data
    onChange({ avatarUrl: '' })
    router.refresh()
  }

  return (
    <div className="space-y-6 overflow-y-auto">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-semibold">Let's set up your profile</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="relative w-max mx-auto">
            <AvatarUpload
              currentImageUrl={data.avatarUrl || undefined}
              fallbackUrl={getDefaultAvatarUrl(data.sex) || undefined}
              onImageUploaded={handleAvatarUpload}
              onImageRemoved={handleAvatarRemove}
              alt={`${data.firstName || ''} ${data.lastName || ''}`}
              id="avatar-file-input-onboarding"
            />
          </div>
          <div className="space-y-2 w-full">
            <Input
              label="First Name"
              id="firstName"
              className="w-full"
              variant="ghost"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Enter your first name"
            />
          </div>
          <div className="space-y-2 w-full">
            <Input
              label="Last Name"
              id="lastName"
              className="w-full"
              variant="ghost"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birthday">Date of Birth</Label>
          <DatePicker
            date={data.birthday ? new Date(data.birthday) : undefined}
            dateFormat="d MMM yyyy"
            setDate={(date) =>
              date && onChange({ birthday: date.toISOString() })
            }
            buttonProps={{
              variant: 'secondary',
            }}
          />
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="sex">Gender</Label>
          <RadioButtons
            value={data.sex || ''}
            onValueChange={(value) => onChange({ sex: value })}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
