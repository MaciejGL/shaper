import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { Profile } from './types'

type BioProps = {
  isEditing: boolean
  profile: Pick<Profile, 'bio'>
  handleChange: (field: keyof Profile, value: string | number | null) => void
}

export function Bio({ isEditing, profile, handleChange }: BioProps) {
  return (
    <Card borderless>
      <CardHeader>
        <CardTitle>About Me</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          variant="ghost"
          id="bio"
          className="min-h-[100px]"
          value={profile?.bio ?? ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          disabled={!isEditing}
        />
      </CardContent>
    </Card>
  )
}
