import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Profile } from './types'

type BioProps = {
  isEditing: boolean
  profile: Pick<Profile, 'bio'>
  handleChange: (field: keyof Profile, value: string | number | null) => void
}

export function Bio({ isEditing, profile, handleChange }: BioProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Me</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            variant="ghost"
            id="bio"
            className="min-h-[100px]"
            value={profile?.bio ?? ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </CardContent>
    </Card>
  )
}
