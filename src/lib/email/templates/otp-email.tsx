import * as React from 'react'

import {
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface OtpEmailProps {
  code: string
  userName?: string | null
}

export const OtpEmail = ({ code, userName }: OtpEmailProps) => (
  <EmailWrapper previewText={`Your Hypertro login code: ${code}`}>
    <EmailHeader brandName="Hypertro" />
    <EmailContent>
      <EmailHeading size={2}>
        {userName ? `Hello ${userName}! 👋` : 'Hello! 👋'}
      </EmailHeading>

      <EmailText center>Your Hypertro login code</EmailText>

      <EmailHeading size={1} center>
        {code}
      </EmailHeading>

      <EmailText color="secondary" size={5}>
        This code will expire in 10 minutes for your security.
      </EmailText>

      <EmailText size={5}>
        If you didn't request this code, you can safely ignore this email.
        Someone else might have typed your email address by mistake.
      </EmailText>

      <EmailText size={5}>
        Stay fit! 💪
        <br />
        <strong>The Hypertro Team</strong>
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypertro" />
  </EmailWrapper>
)
