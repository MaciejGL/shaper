'use client'

import { Check, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

/**
 * Compliant way to provide billing access in companion mode
 * Instead of linking directly to payment page (which violates anti-steering),
 * this sends an email with the Stripe portal link
 */
export function SendAccessLinkButton() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSend = async () => {
    setStatus('sending')

    try {
      const response = await fetch('/api/account/send-access-link', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to send access link')
      }

      setStatus('sent')
      toast.success('Email sent! Check your inbox for the access link.')
    } catch (error) {
      console.error('Failed to send access link:', error)
      toast.error('Failed to send email. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSend}
        loading={status === 'sending'}
        disabled={status === 'sent'}
        variant="secondary"
        iconStart={status === 'sent' ? <Check /> : <Mail />}
        className="w-full"
      >
        {status === 'sent'
          ? 'Email sent!'
          : 'Email me a link to manage my account'}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {status === 'sent'
          ? 'Check your inbox for the access link.'
          : "You'll receive an email with a secure link shortly."}
      </p>
    </div>
  )
}
