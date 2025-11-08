import { Star } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { SectionIcon } from '../ui/section-icon'

import { Profile } from './types'

type BioProps = {
  profile: Pick<Profile, 'bio'>
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
}

export function Bio({ profile, handleChange }: BioProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={Star} variant="purple" />
          About Me
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          variant="ghost"
          id="bio"
          className="min-h-[100px]"
          value={profile?.bio ?? ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Tell us about yourself, your fitness journey, or what motivates you..."
        />
      </CardContent>
    </Card>
  )
}
