'use client'

import { FileText } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getServiceTerms } from '@/constants/terms-versions'

interface CoachingServiceTermsProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  serviceType?: 'coaching' | 'premium'
  trainerName?: string
  packages?: { name: string; description?: string }[]
  readOnly?: boolean
}

export function CoachingServiceTerms({
  isOpen,
  onClose,
  onAccept,
  serviceType = 'coaching',
  trainerName = 'Your Trainer',
  packages = [],
  readOnly = false,
}: CoachingServiceTermsProps) {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)

  const handleAccept = () => {
    if (!hasAcceptedTerms) return
    onAccept?.()
  }

  const handleClose = () => {
    setHasAcceptedTerms(false)
    onClose()
  }

  const isCoaching = serviceType === 'coaching'
  const terms = getServiceTerms(serviceType)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        dialogTitle={terms?.title || 'Service Terms'}
        className="max-w-2xl max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{terms?.title || 'Service Terms'}</span>
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? 'Review the service terms and conditions'
              : terms?.description ||
                'Please review and agree to these terms before proceeding'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-6 text-sm">
            {/* Coaching specific information */}
            {isCoaching && (trainerName || packages.length > 0) && (
              <section>
                <h3 className="font-semibold text-base mb-3">
                  Service Details
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  {trainerName && (
                    <p>
                      <strong className="text-primary">Trainer:</strong>{' '}
                      {trainerName}
                    </p>
                  )}
                  {packages.length > 0 && (
                    <div>
                      <strong className="text-primary">
                        Services Included:
                      </strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {packages.map((pkg, index) => (
                          <li key={index}>
                            <strong className="text-primary">{pkg.name}</strong>
                            {pkg.description && (
                              <span className="text-xs block ml-4 text-muted-foreground">
                                {pkg.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Dynamic terms sections from versioned content */}
            {terms?.sections.map((section, index) => (
              <section key={index}>
                <h3 className="font-semibold text-base mb-3">
                  {section.title}
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  {section.content.map((item, itemIndex) => (
                    <p key={itemIndex}>{item}</p>
                  ))}
                </div>
              </section>
            ))}

            {/* Legal links */}
            <section>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  For complete legal information, please review our{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-3">
          {readOnly ? (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <div className="flex items-center space-x-2 w-full">
                <Checkbox
                  id="accept-terms"
                  checked={hasAcceptedTerms}
                  onCheckedChange={(checked) =>
                    setHasAcceptedTerms(checked === true)
                  }
                />
                <label
                  htmlFor="accept-terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to these service terms and understand my
                  rights and obligations
                </label>
              </div>
              <div className="flex space-x-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!hasAcceptedTerms}
                  className="flex-1"
                >
                  Accept & Proceed
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
