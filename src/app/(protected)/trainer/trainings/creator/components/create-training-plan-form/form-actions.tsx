import { Copy, RefreshCcwIcon, Save, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useTrainingPlanForm } from './use-training-plan-form'

type FormActionsProps = {
  isDirty: boolean
  trainingId?: string
  isPending: boolean
  isUpdating: boolean
  isDuplicating: boolean
  isDeleting: boolean
  onDelete: ReturnType<typeof useTrainingPlanForm>['handleDelete']
  onClearDraft: ReturnType<typeof useTrainingPlanForm>['clearDraft']
  onDuplicate: ReturnType<typeof useTrainingPlanForm>['handleDuplicate']
  onSubmit: ReturnType<typeof useTrainingPlanForm>['handleSubmit']
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
  onSubmit,
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 items-center">
      {isDirty && (
        <p className="text-sm text-muted-foreground">Unsaved changes</p>
      )}
      {trainingId && (
        <Button
          variant="ghost"
          onClick={() => onDelete(trainingId)}
          loading={isDeleting}
          disabled={isDuplicating || isDeleting || isPending}
          iconOnly={<Trash2 />}
        >
          Delete
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={onClearDraft}
        className="ml-2"
        disabled={
          isPending || isUpdating || isDuplicating || isDeleting || !isDirty
        }
        iconOnly={<RefreshCcwIcon />}
      />
      {trainingId && (
        <Button
          variant="ghost"
          onClick={() => onDuplicate(trainingId)}
          iconOnly={<Copy />}
          disabled={isDuplicating || isDeleting || isPending}
          loading={isDuplicating}
        >
          Duplicate
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={onSubmit}
        iconStart={<Save />}
        loading={isPending || isUpdating}
        disabled={isDuplicating || isDeleting || isPending}
      >
        Save Plan
      </Button>
    </div>
  )
}
