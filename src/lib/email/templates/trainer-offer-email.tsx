import * as React from 'react'

import {
  EmailButton,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailText,
  EmailWrapper,
} from './components'

interface TrainerOfferEmailProps {
  clientName?: string | null
  trainerName: string
  bundleItems: {
    quantity: number
    packageName: string
    services: string[]
  }[]
  personalMessage?: string | null
  offerUrl: string
  expiresAt: string
}

export const TrainerOfferEmail = ({
  clientName,
  trainerName,
  bundleItems,
  personalMessage,
  offerUrl,
  expiresAt,
}: TrainerOfferEmailProps) => {
  const bundleDescription = bundleItems
    .map((item) => `${item.quantity}x ${item.packageName}`)
    .join(', ')

  const allServices = bundleItems.flatMap((item) => item.services)
  const uniqueServices = [...new Set(allServices)]

  const expirationTime = new Date(expiresAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return (
    <EmailWrapper
      previewText={`${trainerName} has sent you a training package offer: ${bundleDescription}`}
    >
      <EmailHeader
        brandName="Training Package Offer"
        backgroundColor="#1e40af"
      />

      <EmailContent>
        <EmailText>Hi {clientName || 'there'},</EmailText>

        <EmailText>
          Great news! <strong>{trainerName}</strong> has created a custom
          training package just for you:
        </EmailText>

        {/* Package Details Box */}
        <div style={packageBox}>
          <h3 style={packageTitle}>Your Training Bundle</h3>
          {bundleItems.map((item, index) => (
            <div key={index} style={packageItem}>
              <div style={packageItemText}>
                <strong>
                  {item.quantity}x {item.packageName}
                </strong>
              </div>
              <div style={servicesList}>
                Includes: {item.services.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Personal Message */}
        {personalMessage && (
          <div style={messageBox}>
            <div style={messageTitle}>Personal Message from {trainerName}:</div>
            <div style={messageText}>"{personalMessage}"</div>
          </div>
        )}

        {/* CTA Button */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton
            href={offerUrl}
            backgroundColor="#1e40af"
            padding="16px 32px"
          >
            View Your Training Package
          </EmailButton>
        </div>

        {/* Package Details */}
        <div style={detailsBox}>
          <div style={detailsTitle}>Package Details</div>
          <div style={detailsText}>• Total packages: {bundleItems.length}</div>
          <div style={detailsText}>
            • Services included: {uniqueServices.join(', ')}
          </div>
          <div style={detailsText}>• Trainer: {trainerName}</div>
        </div>

        {/* Urgency Box */}
        <div style={urgencyBox}>
          <div style={urgencyText}>
            ⏰ This offer expires on {expirationTime}
          </div>
          <div style={urgencySubtext}>
            Don't miss out! Training packages are customized specifically for
            your goals.
          </div>
        </div>

        <EmailText center>
          Questions? Reply to this email or contact your trainer directly.
        </EmailText>
      </EmailContent>

      <EmailFooter
        companyName="Hypertro"
        address={`This email was sent on behalf of ${trainerName}. You're receiving this because ${trainerName} created a training package offer for you.`}
      />
    </EmailWrapper>
  )
}

// Styles for custom styled elements
const packageBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const packageTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
}

const packageItem = {
  marginBottom: '12px',
}

const packageItemText = {
  fontSize: '16px',
  color: '#1f2937',
  margin: '0 0 4px 0',
}

const servicesList = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const messageBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const messageTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px 0',
}

const messageText = {
  fontSize: '16px',
  color: '#92400e',
  fontStyle: 'italic',
  margin: '0',
}

const detailsBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const detailsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px 0',
}

const detailsText = {
  fontSize: '14px',
  color: '#4b5563',
  margin: '0 0 4px 0',
}

const urgencyBox = {
  backgroundColor: '#fee2e2',
  border: '1px solid #fca5a5',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const urgencyText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 8px 0',
}

const urgencySubtext = {
  fontSize: '14px',
  color: '#b91c1c',
  margin: '0',
}

export default TrainerOfferEmail
