import { Copy, MoreHorizontalIcon, RefreshCcwIcon, Trash2 } from 'lucide-react'

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
  isPending: boolean
  isUpdating: boolean
  isDuplicating: boolean
  isDeleting: boolean
  onDelete: (trainingId: string) => Promise<void>
  onClearDraft: () => void
  onDuplicate: (trainingId: string) => Promise<void>
  onSubmit: () => Promise<void>
}

export function FormActions({
  isDirty,
  trainingId,
  isPending,
  isUpdating,
  isDuplicating,
  isDeleting,
  onDelete,
  onClearDraft,
  onDuplicate,
}: FormActionsProps) {
  return (
    <div>
      <div className="flex justify-end gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" iconOnly={<MoreHorizontalIcon />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={onClearDraft}
              disabled={
                isPending ||
                isUpdating ||
                isDuplicating ||
                isDeleting ||
                !isDirty
              }
            >
              <RefreshCcwIcon className="size-4 mr-2" />
              Reset Changes
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDuplicate(trainingId!)}
              loading={isDuplicating}
              disabled={isDuplicating || isDeleting || isPending || !trainingId}
            >
              <Copy className="size-4 mr-2" />
              Duplicate
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(trainingId!)}
              loading={isDeleting}
              disabled={isDuplicating || isDeleting || isPending || !trainingId}
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
