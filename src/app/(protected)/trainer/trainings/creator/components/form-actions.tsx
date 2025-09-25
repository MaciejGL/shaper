import { useIsMutating } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCheck,
  Copy,
  Loader2,
  MoreHorizontalIcon,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { useCreatorContext } from '../hooks/use-creator-context'

type FormActionsProps = {
  trainingId?: string
  isDuplicating: boolean
  isDeleting: boolean
  onDelete: (trainingId: string) => Promise<void>
  onDuplicate: (trainingId: string) => Promise<void>
}

export function FormActions({
  trainingId,
  isDuplicating,
  isDeleting,
  onDelete,

  onDuplicate,
}: FormActionsProps) {
  const pendingMutationsCount = useIsMutating()
  const { formData } = useTrainingPlan()
  const { viewMode, setViewMode } = useCreatorContext()
  const isSavingChanges = pendingMutationsCount > 0

  const isDisabled = formData?.details.assignedTo

  return (
    <div>
      <div className="flex justify-end gap-4 items-center">
        <AnimatePresence mode="wait">
          {isSavingChanges ? (
            <motion.div
              key="saving-changes"
              initial={{ opacity: 0.5, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="size-3 animate-spin text-amber-500" />
              <p className="text-sm text-muted-foreground whitespace-nowrap animate-pulse">
                Saving changes
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="saved-changes"
              initial={{ opacity: 0.5, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-2"
            >
              <CheckCheck className="size-3 text-green-500" />
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                Changes saved
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <Label className="flex items-center justify-center gap-2  whitespace-nowrap rounded-md p-1.5 bg-secondary dark:bg-muted-foreground/10 w-full">
          <Switch
            checked={viewMode === 'compact'}
            onCheckedChange={() =>
              setViewMode(viewMode === 'compact' ? 'full' : 'compact')
            }
          />
          Compact View
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" iconOnly={<MoreHorizontalIcon />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onDuplicate(trainingId!)}
              loading={isDuplicating}
              disabled={
                isSavingChanges || isDuplicating || isDeleting || !trainingId
              }
            >
              <Copy className="size-4 mr-2" />
              Duplicate
            </DropdownMenuItem>

            {!isDisabled && (
              <DropdownMenuItem
                onClick={() => onDelete(trainingId!)}
                loading={isDeleting}
                disabled={
                  isSavingChanges || isDuplicating || isDeleting || !trainingId
                }
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
