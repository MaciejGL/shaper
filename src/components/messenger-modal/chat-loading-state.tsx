import { motion } from 'framer-motion'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChatMessageSkeleton {
  isOwnMessage: boolean
  hasAvatar: boolean
  messageWidths: string[]
  hasTimestamp?: boolean
}

const mockConversation: ChatMessageSkeleton[] = [
  {
    isOwnMessage: false,
    hasAvatar: true,
    hasTimestamp: true,
    messageWidths: ['w-32'],
  },
  {
    isOwnMessage: true,
    hasAvatar: true,
    hasTimestamp: true,
    messageWidths: ['w-48'],
  },
  {
    isOwnMessage: true,
    hasAvatar: false,
    messageWidths: ['w-40'],
  },
  {
    isOwnMessage: false,
    hasAvatar: true,
    hasTimestamp: true,
    messageWidths: ['w-56', 'w-44'],
  },
  {
    isOwnMessage: false,
    hasAvatar: false,
    messageWidths: ['w-36'],
  },
  {
    isOwnMessage: true,
    hasAvatar: true,
    hasTimestamp: true,
    messageWidths: ['w-52'],
  },
  {
    isOwnMessage: false,
    hasAvatar: true,
    hasTimestamp: true,
    messageWidths: ['w-28'],
  },
]

const messageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
}

export function ChatLoadingState() {
  return (
    <div className="h-full overflow-y-auto px-4 py-2 space-y-1 hide-scrollbar">
      <motion.div
        className="space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockConversation.map((msg, index) => (
          <motion.div
            key={index}
            className={cn(
              'flex gap-2 group',
              msg.isOwnMessage && 'flex-row-reverse',
            )}
            variants={messageVariants}
            transition={{
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            {/* Avatar */}
            {msg.hasAvatar ? (
              <Skeleton className="size-8 rounded-full flex-shrink-0" />
            ) : (
              <div className="size-8 flex-shrink-0" />
            )}

            <div
              className={cn(
                'w-max max-w-[80%]',
                msg.isOwnMessage && 'text-left',
              )}
            >
              {/* Timestamp */}
              {msg.hasTimestamp && (
                <div
                  className={cn(
                    'flex items-center gap-2 mb-1',
                    msg.isOwnMessage && 'justify-end',
                  )}
                >
                  <Skeleton className="h-3 w-16" />
                </div>
              )}

              {/* Message bubbles */}
              <div className="space-y-1">
                {msg.messageWidths.map((width, msgIndex) => (
                  <div
                    key={msgIndex}
                    className="bg-card-on-card rounded-xl px-3 py-2"
                  >
                    <Skeleton className={cn('h-4', width)} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <motion.div
          className="flex gap-2 group"
          variants={messageVariants}
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1],
            delay: 0.3,
          }}
        >
          <Skeleton className="size-8 rounded-full flex-shrink-0" />
          <div className="w-max max-w-[80%]">
            <div className="bg-card-on-card rounded-xl px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <motion.div
                    className="size-2 bg-muted-foreground/40 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="size-2 bg-muted-foreground/40 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="size-2 bg-muted-foreground/40 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.4,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
