import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { WeekFormData } from './types'

type WeekDialogProps = {
  editDialogOpen: boolean
  setEditDialogOpen: (open: boolean) => void
  weekForm: WeekFormData
  setWeekForm: (form: WeekFormData) => void
  saveWeekEdit: () => void
}

export function WeekDialog({
  editDialogOpen,
  setEditDialogOpen,
  weekForm,
  setWeekForm,
  saveWeekEdit,
}: WeekDialogProps) {
  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent dialogTitle="Edit Week">
        <DialogHeader>
          <DialogTitle>Edit Week</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="week-name">Week Name</Label>
            <Input
              id="week-name"
              value={weekForm.name}
              onChange={(e) =>
                setWeekForm({ ...weekForm, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="week-description">Description (optional)</Label>
            <Textarea
              id="week-description"
              value={weekForm.description ?? undefined}
              onChange={(e) =>
                setWeekForm({ ...weekForm, description: e.target.value })
              }
              placeholder="Add notes or description for this week"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={saveWeekEdit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
