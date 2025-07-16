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

import { DatePicker } from '../date-picker'

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

            <Input
              variant="ghost"
              id="firstName"
              value={profile?.firstName ?? ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>

            <Input
              variant="ghost"
              id="lastName"
              value={profile?.lastName ?? ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              variant="ghost"
              id="email"
              type="email"
              value={profile?.email ?? ''}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              variant="ghost"
              id="phone"
              value={profile?.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <DatePicker
              date={profile?.birthday ? new Date(profile.birthday) : undefined}
              dateFormat="d MMM yyyy"
              setDate={(date) =>
                date && handleChange('birthday', date.toISOString())
              }
              buttonProps={{
                disabled: !isEditing,
                className: !isEditing ? 'opacity-50  [&>svg]:opacity-50' : '',
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Gender</Label>

            <Select
              value={profile?.sex ?? ''}
              onValueChange={(value) => handleChange('sex', value)}
              disabled={!isEditing}
            >
              <SelectTrigger id="sex" className="w-full" variant="ghost">
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
