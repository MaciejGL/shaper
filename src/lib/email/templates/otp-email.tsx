import {
  EmailAlert,
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
  <EmailWrapper previewText={`Your verification code: ${code}`}>
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Welcome back, ${userName}` : 'Verify your identity'}
      </EmailHeading>

      <EmailText>
        Use the verification code below to complete your sign-in to Hypro.
      </EmailText>

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
          fontWeight: '500',
          textAlign: 'center',
          letterSpacing: '2px',
          color: '#18181b',
          backgroundColor: '#f0f0f0',
          padding: '8px 24px',
          borderRadius: '12px',
          marginBottom: '24px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: 'fit-content',
        }}
      >
        {code}
      </div>

      <EmailAlert>This code expires in 10 minutes for your security</EmailAlert>

      <EmailText size="14px" color="muted">
        If you didn't request this code, please ignore this email. Your account
        remains secure.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
