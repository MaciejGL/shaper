export interface MessengerModalProps {
  isOpen: boolean
  onClose: () => void
  partnerId?: string
  onPartnerChange?: (partnerId: string) => void
}

export interface MessageType {
  __typename?: 'Message'
  id: string
  chatId: string
  content: string
  imageUrl?: string | null
  isEdited: boolean
  isDeleted: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
  }
}

export interface MessageProps {
  message: MessageType
  isOwnMessage: boolean
  isGrouped: boolean
  shouldAnimate?: boolean
  currentUserId?: string
  onEdit: (message: MessageType) => void
  onDelete: (messageId: string) => void
  editingMessageId?: string | null
  editContent: string
  onEditContentChange: (content: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  allowFocus?: boolean
}

export interface MessagesAreaProps {
  messages: MessageType[]
  isLoading: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  currentUserId?: string
  partnerName: string
  editingMessageId?: string | null
  editContent: string
  shouldScrollToBottom?: boolean
  onEditMessage: (message: MessageType) => void
  onDeleteMessage: (messageId: string) => void
  onEditContentChange: (content: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onLoadMoreMessages?: () => void
}
