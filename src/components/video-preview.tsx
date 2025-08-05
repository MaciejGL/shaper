import { VideoIcon } from 'lucide-react'

import { getYouTubeEmbedUrl } from '@/lib/get-youtube-embed-url'

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
      <DialogContent
        dialogTitle="Video Preview"
        className="max-w-screen max-h-screen aspect-video p-0 border-none rounded-md"
      >
        <iframe
          src={getYouTubeEmbedUrl(url, {
            autoplay: false,
            mute: true,
          })}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </DialogContent>
    </Dialog>
  )
}
