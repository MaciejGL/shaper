import {
  EmailAlert,
  EmailCard,
  EmailContent,
  EmailDivider,
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
      <EmailHeading size={2} marginBottom="12px">
        {userName ? `Hi ${userName},` : 'Verify your new email address'}
      </EmailHeading>

      <EmailText marginBottom="20px">
        You've requested to change your email address from{' '}
        <strong>{currentEmail}</strong> to <strong>{newEmail}</strong>.
      </EmailText>

      <EmailText marginBottom="28px">
        To complete this change, please enter the verification code below:
      </EmailText>

      <EmailCard backgroundColor="#f8fafc" borderColor="#e2e8f0" padding="32px">
        <EmailText
          size={5}
          color="muted"
          center
          marginBottom="8px"
          weight={500}
        >
          VERIFICATION CODE
        </EmailText>
        <EmailHeading
          size={1}
          center
          weight={700}
          marginBottom="0"
          color="primary"
        >
          {code}
        </EmailHeading>
      </EmailCard>

      <EmailAlert type="warning">
        ⏰ This code expires in 10 minutes for your security
      </EmailAlert>

      <EmailAlert type="info">
        🔐 Your current email ({currentEmail}) will remain active until this
        change is verified
      </EmailAlert>

      <EmailDivider />

      <EmailText size={5} color="muted" marginBottom="8px">
        If you didn't request this email change, please ignore this email and
        your account will remain secure. You may also want to review your
        account security.
      </EmailText>

      <EmailText size={5} color="muted" marginBottom="0">
        Need help? Contact our support team at{' '}
        <a
          href="mailto:support@hypro.app"
          style={{ color: '#0f172a', textDecoration: 'underline' }}
        >
          support@hypro.app
        </a>
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
