import { useIsMutating } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Copy,
  Loader2,
  MoreHorizontalIcon,
  RefreshCcwIcon,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type FormActionsProps = {
  isDirty: boolean
  trainingId?: string
  isDuplicating: boolean
  isDeleting: boolean
  onDelete: (trainingId: string) => Promise<void>
  onClearDraft: () => void
  onDuplicate: (trainingId: string) => Promise<void>
}

export function FormActions({
  isDirty,
  trainingId,

  isDuplicating,
  isDeleting,
  onDelete,
  onClearDraft,
  onDuplicate,
}: FormActionsProps) {
  const pendingMutationsCount = useIsMutating()

  const isSavingChanges = pendingMutationsCount > 0

  return (
    <div>
      <div className="flex justify-end gap-2 items-center">
        <AnimatePresence>
          {isSavingChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-muted-foreground">
                <Loader2 className="size-4 mr-2 animate-spin" /> Saving
                changes...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" iconOnly={<MoreHorizontalIcon />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={onClearDraft}
              disabled={
                isSavingChanges || isDuplicating || isDeleting || !isDirty
              }
            >
              <RefreshCcwIcon className="size-4 mr-2" />
              Reset Changes
            </DropdownMenuItem>

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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
