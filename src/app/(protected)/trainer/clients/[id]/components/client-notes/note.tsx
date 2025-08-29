import { Check, Edit3, Share, Trash2, X } from 'lucide-react'

import { AnimatedContainer } from '@/components/animations/animated-container'
import { Divider } from '@/components/divider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { Note } from './types'

// Individual note component
export function Note({
  note,
  isEditing,
  editingText,
  editingShareWithClient,
  isUpdatingNote,
  isDeletingNote,
  loading,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteNote,
  onEditingTextChange,
  onEditingShareWithClientChange,
}: {
  note: Note
  isEditing: boolean
  editingText: string
  editingShareWithClient: boolean
  isUpdatingNote: boolean
  isDeletingNote: boolean
  loading: boolean
  onStartEdit: (note: Note) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDeleteNote: (id: string) => void
  onEditingTextChange: (text: string) => void
  onEditingShareWithClientChange: (share: boolean) => void
}) {
  return (
    <div
      className={cn(
        'transition-all duration-200 group/note bg-secondary dark:bg-input/30 rounded-md p-2',
        loading && 'masked-placeholder-text',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                id="edit-note"
                value={editingText}
                onChange={(e) => onEditingTextChange(e.target.value)}
                className="min-h-[120px] resize-none border-none dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none -m-2 p-2 leading-relaxed"
                autoFocus
              />

              <div className="flex items-center space-x-2 mt-3">
                <Switch
                  id="share-edit-note-client"
                  checked={editingShareWithClient}
                  onCheckedChange={onEditingShareWithClientChange}
                />
                <Label
                  htmlFor="share-edit-note-client"
                  className="text-sm text-muted-foreground"
                >
                  Share with client
                </Label>
              </div>

              <Divider className="mb-2" />

              <AnimatedContainer
                isVisible={true}
                className="flex justify-between gap-2"
                id="edit-note-actions"
              >
                <Button
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => onDeleteNote(note.id)}
                  loading={isDeletingNote}
                  iconOnly={<Trash2 />}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelEdit}
                    disabled={isUpdatingNote}
                    iconStart={<X />}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    disabled={!editingText.trim() || isUpdatingNote}
                    loading={isUpdatingNote}
                    iconStart={<Check />}
                  >
                    Save
                  </Button>
                </div>
              </AnimatedContainer>
            </div>
          ) : (
            <>
              <p
                className={cn(
                  'text-sm leading-relaxed break-words whitespace-pre-wrap',
                )}
              >
                {note.text}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  {note.shareWithClient && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                      <Share className="h-3 w-3" />
                      <span>Shared with client</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onStartEdit(note)}
              iconOnly={<Edit3 />}
            />
          </div>
        )}
      </div>
    </div>
  )
}
