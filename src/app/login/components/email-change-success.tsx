'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function EmailChangeSuccess() {
  const searchParams = useSearchParams()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get('message') === 'email-changed') {
      setShowMessage(true)
      // Auto-hide after 10 seconds
      setTimeout(() => setShowMessage(false), 10000)
    }
  }, [searchParams])

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          key="email-change-success"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="dark mb-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BiggyIcon size="sm" icon={CheckSquare} variant="success" />{' '}
                <p className="text-sm">Email Address Updated Successfully</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your email address has been updated successfully. Please sign in
                with your new email address.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
