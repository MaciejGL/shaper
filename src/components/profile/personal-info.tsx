import { ReadOnlyField } from '@/components/read-only-field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Profile } from './types'

type PersonalInfoProps = {
  isEditing: boolean
  profile: Pick<
    Profile,
    'firstName' | 'lastName' | 'phone' | 'birthday' | 'sex' | 'email'
  >
  handleChange: (field: keyof Profile, value: string) => void
}
export function PersonalInfo({
  isEditing,
  profile,
  handleChange,
}: PersonalInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            {isEditing ? (
              <Input
                id="firstName"
                value={profile?.firstName ?? ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            ) : (
              <ReadOnlyField value={profile?.firstName ?? ''} />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            {isEditing ? (
              <Input
                id="lastName"
                value={profile?.lastName ?? ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            ) : (
              <ReadOnlyField value={profile?.lastName ?? ''} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={profile?.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            ) : (
              <ReadOnlyField value={profile?.email ?? ''} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={profile?.phone ?? ''}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            ) : (
              <ReadOnlyField value={profile?.phone ?? ''} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            {isEditing ? (
              <Input
                id="dob"
                type="date"
                value={profile?.birthday ?? ''}
                onChange={(e) => handleChange('birthday', e.target.value)}
              />
            ) : (
              <ReadOnlyField value={profile?.birthday ?? ''} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            {isEditing ? (
              <Select
                value={profile?.sex ?? ''}
                onValueChange={(value) => handleChange('sex', value)}
              >
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <ReadOnlyField value={profile?.sex ?? ''} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
