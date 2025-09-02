import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, PenIcon, Star, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { SectionIcon } from '../ui/section-icon'

import { Profile } from './types'

type BioProps = {
  profile: Pick<Profile, 'bio'>
  handleChange: (field: keyof Profile, value: string | number | null) => void
  isSectionEditing: boolean
  onToggleEdit: () => void
  onSave: () => void
  isSaving: boolean
}

export function Bio({
  profile,
  handleChange,
  isSectionEditing,
  onToggleEdit,
  onSave,
  isSaving,
}: BioProps) {
  return (
    <Card borderless>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={Star} variant="purple" />
          About Me
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
                iconOnly={<PenIcon />}
                variant="secondary"
                size="icon-md"
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
      <CardContent>
        <Textarea
          variant="ghost"
          id="bio"
          className="min-h-[100px]"
          value={profile?.bio ?? ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          disabled={!isSectionEditing}
        />
      </CardContent>
    </Card>
  )
}
