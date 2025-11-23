import {
  EmailAlert,
  EmailCard,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface EmailChangeOtpProps {
  code: string
  userName?: string | null
  currentEmail: string
  newEmail: string
}

export const EmailChangeOtp = ({
  code,
  userName,
  currentEmail,
  newEmail,
}: EmailChangeOtpProps) => (
  <EmailWrapper previewText={`Verify your new email address: ${code}`}>
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hi ${userName},` : 'Verify your new email address'}
      </EmailHeading>

      <EmailText>
        You've requested to change your email address from{' '}
        <strong>{currentEmail}</strong> to <strong>{newEmail}</strong>.
      </EmailText>

      <EmailText>
        To complete this change, please enter the verification code below:
      </EmailText>

      <EmailCard padding="32px">
        <EmailText
          size="14px"
          color="muted"
          style={{
            textAlign: 'center',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Verification Code
        </EmailText>
        <div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: '4px',
            color: '#18181b',
          }}
        >
          {code}
        </div>
      </EmailCard>

      <EmailAlert>
        This code expires in 10 minutes for your security. Your current email (
        {currentEmail}) will remain active until this change is verified.
      </EmailAlert>

      <EmailText size="14px" color="muted">
        If you didn't request this email change, please ignore this email and
        your account will remain secure. You may also want to review your
        account security.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
