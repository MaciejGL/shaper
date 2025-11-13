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

interface OtpEmailProps {
  code: string
  userName?: string | null
}

export const OtpEmail = ({ code, userName }: OtpEmailProps) => (
  <EmailWrapper previewText={`Your verification code: ${code}`}>
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading size={2} marginBottom="12px">
        {userName ? `Welcome back, ${userName}` : 'Verify your identity'}
      </EmailHeading>

      <EmailText marginBottom="28px">
        Use the verification code below to complete your sign-in to Hypro.
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

      <EmailDivider />

      <EmailText size={5} color="muted" marginBottom="8px">
        If you didn't request this code, please ignore this email. Your account
        remains secure.
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
