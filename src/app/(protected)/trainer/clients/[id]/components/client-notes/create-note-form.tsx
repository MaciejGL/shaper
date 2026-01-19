import { Check, XIcon } from 'lucide-react'

import { AnimatedContainer } from '@/components/animations/animated-container'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// Note creation form component
export function CreateNoteForm({
  isCreating,
  newNoteText,
  newNoteShareWithClient,
  isCreatingNote,
  onNewNoteTextChange,
  onNewNoteShareWithClientChange,
  onCreateNote,
  onCancelCreate,
}: {
  isCreating: boolean
  newNoteText: string
  newNoteShareWithClient: boolean
  isCreatingNote: boolean
  onNewNoteTextChange: (text: string) => void
  onNewNoteShareWithClientChange: (share: boolean) => void
  onCreateNote: () => void
  onCancelCreate: () => void
}) {
  return (
    <AnimatedContainer
      isVisible={isCreating}
      className="overflow-hidden w-full"
      id="create-note-form"
    >
      <div
        className={cn(
          'transition-all duration-200 group/note bg-secondary dark:bg-input/30 rounded-md p-2',
        )}
      >
        <Textarea
          id="new-note"
          placeholder="Write your note here..."
          variant="ghost"
          className="min-h-[120px]"
          value={newNoteText}
          onChange={(e) => onNewNoteTextChange(e.target.value)}
        />

        <div className="flex items-center justify-between mt-3 pt-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="share-new-note-client"
              checked={newNoteShareWithClient}
              onCheckedChange={onNewNoteShareWithClientChange}
            />
            <Label
              htmlFor="share-new-note-client"
              className="text-sm text-muted-foreground"
            >
              Share with client
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelCreate}
              disabled={isCreatingNote}
              iconStart={<XIcon />}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onCreateNote}
              disabled={!newNoteText.trim() || isCreatingNote}
              loading={isCreatingNote}
              iconStart={<Check />}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  )
}
