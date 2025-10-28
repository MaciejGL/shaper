'use client'

import { useUser } from '@/context/user-context'
import { useAnnouncements } from '@/hooks/use-announcements'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'

export function AnnouncementBanner() {
  const user = useUser()
  const { currentAnnouncement, dismissAnnouncement, isLoaded } =
    useAnnouncements()

  if (!isLoaded || !currentAnnouncement) {
    return null
  }

  return (
    <Dialog
      open={true}
      modal={false}
      onOpenChange={() => {
        dismissAnnouncement(currentAnnouncement.id)
      }}
    >
      <DialogContent
        fullScreen
        dialogTitle={currentAnnouncement.title}
        className="pt-16 space-y-4"
      >
        <DialogTitle>Hello {user.user?.profile?.firstName}!</DialogTitle>
        <p className="whitespace-pre-line text-base">
          {currentAnnouncement.content}
        </p>

        <Button
          variant="default"
          size="lg"
          onClick={() => dismissAnnouncement(currentAnnouncement.id)}
        >
          Thank You and have a great workout!
        </Button>
      </DialogContent>
    </Dialog>
  )
}
