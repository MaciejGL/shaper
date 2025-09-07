import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

import type { MessageProps } from './types'
import { formatMessageTime } from './utils'

export function Message({
  message,
  isOwnMessage,
  isGrouped,
  shouldAnimate = true,
  onEdit,
  onDelete,
  editingMessageId,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
}: MessageProps) {
  const isEditing = editingMessageId === message.id

  return (
    <motion.div
      className={cn(
        'flex gap-2 group',
        isOwnMessage && 'flex-row-reverse',
        isGrouped && 'mt-0',
      )}
      initial={shouldAnimate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={
        shouldAnimate
          ? {
              duration: 0.2,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.05,
            }
          : { duration: 0 }
      }
      layout
    >
      {/* Avatar - only show for first message in group */}
      {isGrouped ? (
        <div className="size-8" />
      ) : (
        <UserAvatar
          withFallbackAvatar
          firstName={message.sender.firstName || ''}
          lastName={message.sender.lastName || ''}
          imageUrl={message.sender.image || undefined}
          className="size-8"
        />
      )}

      <div className={cn('w-max max-w-[80%]', isOwnMessage && 'text-left')}>
        {/* Timestamp - only show for first message in group */}
        {!isGrouped && (
          <div
            className={cn(
              'flex items-center gap-2 mb-1',
              isOwnMessage && 'justify-end',
            )}
          >
            <span className="text-[10px] text-muted-foreground dark:text-muted-foreground/50">
              {formatMessageTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-xs text-muted-foreground dark:text-muted-foreground/50 italic">
                edited
              </span>
            )}
          </div>
        )}

        {/* Show edited indicator for grouped messages */}
        {isGrouped && message.isEdited && (
          <div
            className={cn(
              'flex items-center gap-2 mb-1',
              isOwnMessage && 'justify-end',
            )}
          >
            <span className="text-xs text-muted-foreground italic">edited</span>
          </div>
        )}

        {/* Message content or edit form */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              id={`edit-${message.id}`}
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSaveEdit()
                }
                if (e.key === 'Escape') onCancelEdit()
              }}
              placeholder="Edit your message... (Ctrl+Enter to save, Esc to cancel)"
              className="min-h-max resize-none"
              autoFocus
            />
            <div className="grid grid-cols-[1fr_auto_auto] gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDelete(message.id)}
                iconOnly={<Trash2 className="opacity-70" />}
              />
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="tertiary"
                onClick={onSaveEdit}
                disabled={!editContent.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'rounded-xl px-3 py-2 bg-gradient-to-br',
              isOwnMessage
                ? 'from-amber-400/30 to-amber-400/50 dark:from-amber-500/60 dark:to-amber-500/50'
                : 'from-primary/5 to-primary/10',
            )}
          >
            <p
              className={cn(
                'text-sm whitespace-pre-wrap',
                message.isDeleted && 'italic text-muted-foreground text-xs',
              )}
              onClick={() => isOwnMessage && onEdit(message)}
            >
              {message.content}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
