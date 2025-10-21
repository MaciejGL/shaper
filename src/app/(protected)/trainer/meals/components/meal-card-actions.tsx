'use client'

import {
  Archive,
  ArchiveRestore,
  Copy,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { GQLGetMealsForLibraryQuery } from '@/generated/graphql-client'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

interface MealCardActionsProps {
  meal: Meal
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onArchive: () => void
  onUnarchive: () => void
}

export function MealCardActions({
  meal,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onUnarchive,
}: MealCardActionsProps) {
  const isInUse = meal.usageCount > 0
  const isArchived = meal.archived

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" iconOnly={<MoreVertical />} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>

        {!isInUse && !isArchived && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="size-4" />
            Edit
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="size-4" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isArchived ? (
          <DropdownMenuItem onClick={onUnarchive}>
            <ArchiveRestore className="size-4" />
            Unarchive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={onDelete}
                disabled={isInUse}
                className="text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </TooltipTrigger>
            {isInUse && (
              <TooltipContent>
                Cannot delete meal used in {meal.usageCount} plan
                {meal.usageCount > 1 ? 's' : ''}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
