'use client'

import { X } from 'lucide-react'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { HeightInput } from '@/components/ui/height-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WeightInput } from '@/components/ui/weight-input'

import { useCompleteProfileDrawer } from './use-complete-profile-drawer'
import type { CompleteProfileDrawerProps, SexOption } from './types'

export function CompleteProfileDrawer({
  open,
  onOpenChange,
  // kept for API compatibility with banner; validation lives in the drawer itself
  missingSteps: _missingSteps,
}: CompleteProfileDrawerProps) {
  const {
    form,
    setFirstName,
    setLastName,
    setSex,
    setBirthday,
    setHeightCm,
    setWeightKg,
    canSave,
    isPending,
    handleSave,
  } = useCompleteProfileDrawer({
    open,
    onClose: () => onOpenChange(false),
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        dialogTitle="Complete profile"
        className="w-full! max-w-none! h-full"
        grabber={false}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold">Complete profile</p>
              <p className="text-sm text-muted-foreground">
                Add these details to unlock better insights.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              iconOnly={<X />}
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="firstName"
                  label="First name"
                  value={form.firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  variant="secondary"
                  placeholder="e.g. Alex"
                />
                <Input
                  id="lastName"
                  label="Last name (optional)"
                  value={form.lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  variant="secondary"
                  placeholder="e.g. Smith"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We use your name to personalize your account.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.sex}
                onValueChange={(value) => setSex(value as SexOption)}
              >
                <SelectTrigger className="w-full" variant="secondary" size="md">
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
              <p className="text-xs text-muted-foreground">
                Used to show the right avatar and match the muscle heatmap body
                view.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Birthday</Label>
              <DatePicker
                date={form.birthday}
                dateFormat="d MMM yyyy"
                buttonProps={{ size: 'lg', variant: 'secondary' }}
                setDate={setBirthday}
              />
              <p className="text-xs text-muted-foreground">
                Helps us get your current age for more accurate statistics.
              </p>
            </div>

            <div className="space-y-2">
              <HeightInput
                label="Height"
                heightInCm={form.heightCm}
                onHeightChange={setHeightCm}
              />
              <p className="text-xs text-muted-foreground">
                Used to estimate energy expenditure and body fat percentage.
              </p>
            </div>

            <div className="space-y-2">
              <WeightInput
                label="Weight"
                weightInKg={form.weightKg}
                onWeightChange={setWeightKg}
              />
              <p className="text-xs text-muted-foreground">
                Used to estimate energy expenditure and body fat percentage.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <Button
              className="w-full"
              size="lg"
              loading={isPending}
              disabled={!canSave || isPending}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

