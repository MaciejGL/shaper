'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Icon } from '@/components/icons/icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TrainerCertificatesGalleryProps {
  urls: string[]
}

function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf')
}

function getFilenameFromUrl(url: string): string {
  const path = url.split('/').pop() || ''
  // Remove timestamp prefix: "1735500000-filename.pdf" -> "filename.pdf"
  const withoutTimestamp = path.replace(/^\d+-/, '')
  // Replace underscores with spaces for readability
  return decodeURIComponent(withoutTimestamp).replace(/_/g, ' ')
}

export function TrainerCertificatesGallery({
  urls,
}: TrainerCertificatesGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!urls || urls.length === 0) {
    return null
  }

  const handleClick = (url: string) => {
    if (isPdfUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      setPreviewUrl(url)
    }
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto -mx-4 mb-8 px-4 py-4 scrollbar-hide snap-x snap-mandatory">
        {urls.map((url, index) => {
          const isPdf = isPdfUrl(url)

          return (
            <button
              key={index}
              onClick={() => handleClick(url)}
              className="relative w-[160px] shrink-0 aspect-[4/3] rounded-xl overflow-hidden border bg-muted/50 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary snap-center shadow-sm border-border"
            >
              {isPdf ? (
                <div className="w-full h-full flex flex-col">
                  {/* Icon Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2">
                    <Icon name="pdf" size={32} className="text-primary/60" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {getFilenameFromUrl(url)}
                    </span>
                  </div>
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`Certificate ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent
          className="max-w-3xl p-0 overflow-hidden"
          dialogTitle="Certificate Preview"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          <Button
            onClick={() => setPreviewUrl(null)}
            size="icon-sm"
            variant="secondary"
            className="absolute top-2 right-2 z-10 rounded-full"
            iconOnly={<X />}
          />
          {previewUrl && (
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={previewUrl}
                alt="Certificate"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
