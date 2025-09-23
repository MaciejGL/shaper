import { UserIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
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
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer'
import { SectionIcon } from '../ui/section-icon'

import { EmailChangeFlow } from './email-change-flow'
import { Profile } from './types'

type PersonalInfoProps = {
  profile: Pick<
    Profile,
    'firstName' | 'lastName' | 'phone' | 'birthday' | 'sex' | 'email'
  >
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
}
export function PersonalInfo({ profile, handleChange }: PersonalInfoProps) {
  const [showEmailChange, setShowEmailChange] = useState(false)

  return (
    <Card className="mb-6" borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={UserIcon} variant="green" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>

            <Input
              variant="secondary"
              id="firstName"
              value={profile?.firstName ?? ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>

            <Input
              variant="secondary"
              id="lastName"
              value={profile?.lastName ?? ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
              <Input
                variant="secondary"
                id="email"
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="grow"
              />
              <Drawer open={showEmailChange} onOpenChange={setShowEmailChange}>
                <DrawerTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => setShowEmailChange(true)}
                  >
                    Change
                  </Button>
                </DrawerTrigger>
                <DrawerContent dialogTitle="Change Email">
                  <EmailChangeFlow
                    currentEmail={profile?.email ?? ''}
                    onCancel={() => setShowEmailChange(false)}
                    onSuccess={() => {
                      setShowEmailChange(false)
                    }}
                  />
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              variant="secondary"
              id="phone"
              value={profile?.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Gender</Label>

            <Select
              value={profile?.sex ?? ''}
              onValueChange={(value) => handleChange('sex', value)}
            >
              <SelectTrigger id="sex" className="w-full" variant="tertiary">
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
