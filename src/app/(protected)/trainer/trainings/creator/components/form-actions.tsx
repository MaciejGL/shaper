import { useIsMutating } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Loader2, MoreHorizontalIcon, Trash2, Users } from 'lucide-react'

import { ManageCollaboratorsDialog } from '@/app/(protected)/trainer/collaboration/components/manage-collaborators-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

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
  const { formData, canAdmin } = useTrainingPlan()

  const isSavingChanges = pendingMutationsCount > 0

  const isDisabled = formData?.details.assignedTo

  return (
    <div>
      <div className="flex justify-end gap-4 items-end">
        <AnimatePresence>
          {isSavingChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4"
            >
              <Loader2 className="size-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Saving changes...</p>
            </motion.div>
          )}
        </AnimatePresence>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" iconOnly={<MoreHorizontalIcon />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onDuplicate(trainingId!)}
              loading={isDuplicating}
              disabled={
                isSavingChanges ||
                isDuplicating ||
                isDeleting ||
                !trainingId ||
                !canAdmin
              }
            >
              <Copy className="size-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            {trainingId && (
              <ManageCollaboratorsDialog
                planId={trainingId}
                planTitle={formData?.details.title || 'Training Plan'}
                planType="training"
                trigger={
                  <DropdownMenuItem
                    disabled={
                      isSavingChanges ||
                      isDuplicating ||
                      isDeleting ||
                      !trainingId ||
                      !canAdmin
                    }
                  >
                    <Users className="size-4 mr-2" />
                    Manage Collaborators
                  </DropdownMenuItem>
                }
              />
            )}

            {!isDisabled && (
              <DropdownMenuItem
                onClick={() => onDelete(trainingId!)}
                loading={isDeleting}
                disabled={
                  isSavingChanges ||
                  isDuplicating ||
                  isDeleting ||
                  !trainingId ||
                  !canAdmin
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
