import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, PenIcon, UserIcon, XIcon } from 'lucide-react'

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
import { SectionIcon } from '../ui/section-icon'

import { Profile } from './types'

type PersonalInfoProps = {
  profile: Pick<
    Profile,
    'firstName' | 'lastName' | 'phone' | 'birthday' | 'sex' | 'email'
  >
  handleChange: (field: keyof Profile, value: string | number | null) => void
  isSectionEditing: boolean
  onToggleEdit: () => void
  onSave: () => void
  isSaving: boolean
}
export function PersonalInfo({
  profile,
  handleChange,
  isSectionEditing,
  onToggleEdit,
  onSave,
  isSaving,
}: PersonalInfoProps) {
  return (
    <Card className="mb-6" borderless>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={UserIcon} variant="green" />
          Personal Information
        </CardTitle>
        <AnimatePresence mode="wait">
          {!isSectionEditing ? (
            <motion.div
              key="edit-button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.13 }}
            >
              <Button
                onClick={onToggleEdit}
                variant="secondary"
                size="icon-md"
                iconOnly={<PenIcon />}
              >
                Edit
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="save-button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.13 }}
            >
              <div className="flex gap-2">
                <Button
                  onClick={onToggleEdit}
                  variant="secondary"
                  disabled={isSaving}
                  iconOnly={<XIcon />}
                  size="icon-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  iconOnly={<CheckIcon />}
                  size="icon-md"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              disabled={!isSectionEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>

            <Input
              variant="ghost"
              id="lastName"
              value={profile?.lastName ?? ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={!isSectionEditing}
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
              disabled={!isSectionEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              variant="ghost"
              id="phone"
              value={profile?.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isSectionEditing}
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
                disabled: !isSectionEditing,
                className: !isSectionEditing
                  ? 'opacity-50  [&>svg]:opacity-50'
                  : '',
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Gender</Label>

            <Select
              value={profile?.sex ?? ''}
              onValueChange={(value) => handleChange('sex', value)}
              disabled={!isSectionEditing}
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
