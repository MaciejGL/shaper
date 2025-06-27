import { Check, XIcon } from 'lucide-react'

import { AnimatedContainer } from '@/components/animations/animated-container'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Note creation form component
export function CreateNoteForm({
  isCreating,
  newNoteText,
  isCreatingNote,
  onNewNoteTextChange,
  onCreateNote,
  onCancelCreate,
}: {
  isCreating: boolean
  newNoteText: string
  isCreatingNote: boolean
  onNewNoteTextChange: (text: string) => void
  onCreateNote: () => void
  onCancelCreate: () => void
}) {
  return (
    <AnimatedContainer
      isVisible={isCreating}
      className="overflow-hidden"
      id="create-note-form"
    >
      <Textarea
        id="new-note"
        placeholder="Write your note here..."
        value={newNoteText}
        onChange={(e) => onNewNoteTextChange(e.target.value)}
        className="min-h-[120px] resize-none border-none bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 mt-4"
        autoFocus
      />
      <div className="flex gap-2 mt-3 justify-end">
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
    </AnimatedContainer>
  )
}
