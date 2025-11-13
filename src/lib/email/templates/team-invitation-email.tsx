import {
  EmailAlert,
  EmailButton,
  EmailCard,
  EmailContent,
  EmailDivider,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface TeamInvitationEmailProps {
  invitedUserName?: string | null
  inviterName: string
  teamName: string
  locations: string[]
  invitationUrl: string
}

export const TeamInvitationEmail = ({
  invitedUserName,
  inviterName,
  teamName,
  locations,
  invitationUrl,
}: TeamInvitationEmailProps) => {
  const locationsText =
    locations.length > 0 ? locations.join(', ') : 'Multiple locations'

  return (
    <EmailWrapper
      previewText={`${inviterName} has invited you to join the ${teamName} team`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading size={2} marginBottom="12px">
          Team invitation
        </EmailHeading>

        <EmailText marginBottom="24px">
          {invitedUserName ? `Hi ${invitedUserName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="28px">
          <strong>{inviterName}</strong> has invited you to join their team on
          Hypro. Join their team to collaborate, share training plans, and work
          together towards your fitness goals.
        </EmailText>

        <EmailCard>
          <EmailHeading size={3} marginBottom="16px" weight={600}>
            Team Details
          </EmailHeading>

          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              {teamName}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Locations: {locationsText}
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#475569' }}>
              <strong>Invited by:</strong> {inviterName}
            </div>
          </div>
        </EmailCard>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton href={invitationUrl} size="lg">
            Accept Team Invitation
          </EmailButton>
        </div>

        <EmailAlert type="info">
          By accepting this invitation, you'll be able to collaborate with team
          members, share training plans, and coordinate your fitness activities
          together.
        </EmailAlert>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="0">
          Questions about this invitation? Contact {inviterName} directly or
          reach out to our support team at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
        </EmailText>
      </EmailContent>

      <EmailFooter
        companyName="Hypro"
        address={`This email was sent on behalf of ${inviterName}. You're receiving this because ${inviterName} invited you to join the ${teamName} team.`}
      />
    </EmailWrapper>
  )
}

export default TeamInvitationEmail
