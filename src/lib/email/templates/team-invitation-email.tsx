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
        <EmailHeading as="h1">Team invitation</EmailHeading>

        <EmailText>
          {invitedUserName ? `Hi ${invitedUserName},` : 'Hello,'}
        </EmailText>

        <EmailText>
          <strong>{inviterName}</strong> has invited you to join their team on
          Hypro. Join their team to collaborate, share training plans, and work
          together towards your fitness goals.
        </EmailText>

        <EmailCard>
          <EmailHeading as="h3">Team Details</EmailHeading>

          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#18181b',
                marginBottom: '4px',
              }}
            >
              {teamName}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Locations: {locationsText}
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '14px', color: '#4b5563' }}>
              <strong>Invited by:</strong> {inviterName}
            </div>
          </div>
        </EmailCard>

        <EmailButton href={invitationUrl}>Accept Team Invitation</EmailButton>

        <EmailAlert>
          By accepting this invitation, you'll be able to collaborate with team
          members, share training plans, and coordinate your fitness activities
          together.
        </EmailAlert>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          Questions about this invitation? Contact {inviterName} directly.
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
