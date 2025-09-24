'use client'

import { AlertCircle, Info, Shield } from 'lucide-react'

import { SectionIcon } from '@/components/ui/section-icon'

export function CancellationInfo() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Non-binding request */}
        <div>
          <div className="flex gap-3">
            <SectionIcon icon={Shield} variant="green" size="sm" />
            <div className="space-y-2 mt-1">
              <h4 className="font-semibold">No Commitment Required</h4>
              <p className="text-sm">
                Requesting coaching is completely free and creates no
                obligations. You can decline any offer without charge and are
                only committed once you accept an offer and complete payment.
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div>
          <div className="flex gap-3">
            <SectionIcon icon={AlertCircle} variant="blue" size="sm" />
            <div className="space-y-2 mt-1">
              <h4 className="font-semibold">Cancellation Policy</h4>
              <div className="text-sm space-y-2">
                <p>
                  • <strong>One-time services:</strong> Refunds available up to
                  24 hours after purchase if service hasn't been delivered
                </p>
                <p>
                  • <strong>Monthly coaching:</strong> Cancel anytime before
                  your next billing cycle with no penalty
                </p>
                <p>
                  • <strong>In-person sessions:</strong> Cancel at least 24
                  hours before scheduled session for full refund
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What happens after cancellation */}
        <div>
          <div className="flex gap-3">
            <SectionIcon icon={Info} variant="blue" size="sm" />
            <div className="space-y-2 mt-1">
              <h4 className="font-semibold">After Cancellation</h4>
              <ul className="text-sm space-y-1">
                <li className="list-disc list-inside">
                  You'll retain access to any delivered plans until their
                  expiration
                </li>
                <li className="list-disc list-inside">
                  Your trainer will be notified and will provide final guidance
                </li>
                <li className="list-disc list-inside">
                  You can re-engage with the same or different trainer anytime
                </li>
                <li className="list-disc list-inside">
                  All progress data remains in your account permanently
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
