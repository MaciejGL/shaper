'use client'

import { BanIcon, CheckCircleIcon, InfoIcon } from 'lucide-react'

import { SectionIcon } from '@/components/ui/section-icon'

export function CancellationInfo() {
  return (
    <div className="space-y-6">
      {/* Non-binding request */}
      <div className="flex gap-3">
        <SectionIcon icon={CheckCircleIcon} variant="green" size="sm" />
        <div className="space-y-2 mt-1">
          <h4 className="font-semibold">No Commitment Required</h4>
          <p className="text-sm">
            Requesting coaching is completely free and creates no obligations.
            You can decline any offer without charge and are only committed once
            you accept an offer and complete payment.
          </p>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="flex gap-3">
        <SectionIcon icon={BanIcon} variant="yellow" size="sm" />
        <div className="space-y-2 mt-1">
          <h4 className="font-semibold">Cancellation Policy</h4>
          <ul className="text-sm space-y-2">
            <li>
              <strong>One-time services:</strong> Refunds available up to 24
              hours after purchase if service hasn't been delivered
            </li>
            <li>
              <strong>Premium Coaching:</strong> Discuss duration with your
              coach. They will prepare a suitable package for you.
            </li>
            <li>
              <strong>In-person sessions:</strong> Cancel at least 24 hours
              before scheduled session for full refund
            </li>
          </ul>
        </div>
      </div>

      {/* What happens after cancellation */}
      <div className="flex gap-3">
        <SectionIcon icon={InfoIcon} variant="blue" size="sm" />
        <div className="space-y-2 mt-1">
          <h4 className="font-semibold">After Cancellation</h4>
          <ul className="text-sm space-y-2">
            <li>
              You'll retain access to any delivered plans until their expiration
            </li>
            <li>
              Your trainer will be notified and will provide final guidance
            </li>
            <li>
              You can re-engage with the same or different trainer anytime
            </li>
            <li>All progress data remains in your account permanently</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
