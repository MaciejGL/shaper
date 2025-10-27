'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'

import { NotificationData, PromotionalToastConfig } from './types'

interface PromotionalToastProps {
  config: PromotionalToastConfig
  data: NotificationData
  onDismiss: () => void
}

export function PromotionalToast({
  config,
  data,
  onDismiss,
}: PromotionalToastProps) {
  const handlePrimaryAction = async () => {
    onDismiss()
    await config.primaryAction.handler(data)
  }

  return (
    <Card className="w-full max-w-md shadow-2xl" variant="secondary">
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <SectionIcon
            icon={config.icon}
            size="sm"
            variant={config.iconVariant}
          />
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-base text-foreground">
              {config.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {config.getSubtitle(data)}
            </p>
          </div>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          iconOnly={<X />}
          onClick={onDismiss}
          className="shrink-0"
        />
      </CardHeader>

      <CardFooter className="flex gap-2">
        <Button
          variant="tertiary"
          size="sm"
          onClick={onDismiss}
          className="flex-1"
          disabled={config.primaryAction.isLoading}
        >
          Dismiss
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handlePrimaryAction}
          className="flex-1"
          loading={config.primaryAction.isLoading}
          disabled={config.primaryAction.isLoading}
        >
          {config.primaryAction.label}
        </Button>
      </CardFooter>
    </Card>
  )
}
