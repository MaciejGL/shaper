import { VideoIcon } from 'lucide-react'

import { getYouTubeEmbedUrl } from '@/lib/get-youtube-embed-url'
import { cn } from '@/lib/utils'

import { Button, ButtonProps } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

export function VideoPreview({
  url,
  variant = 'ghost',
  size = 'icon-md',
}: {
  url: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} iconOnly={<VideoIcon />} />
      </DialogTrigger>
      <VideoPreviewContent url={url} />
    </Dialog>
  )
}

export function VideoPreviewContent({
  url,
  fullScreen = false,
  classNameCloseButton,
}: {
  url: string
  fullScreen?: boolean
  classNameCloseButton?: string
}) {
  return (
    <DialogContent
      dialogTitle="Exercise Video"
      className={cn(
        'w-screen  aspect-video p-0 border-none rounded-md rotate-90',
        fullScreen && 'max-w-svh max-h-svw w-auto h-svw',
      )}
      classNameOverlay={cn(fullScreen && 'bg-black')}
      classNameCloseButton={classNameCloseButton}
    >
      <iframe
        src={getYouTubeEmbedUrl(url, {
          autoplay: true,
          mute: true,
          loop: true,
          minimal: true,
        })}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full rounded-md"
      />
    </DialogContent>
  )
}
