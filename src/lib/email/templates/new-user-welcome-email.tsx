import { PREMIUM_BENEFITS_EMAIL } from '@/config/premium-features'
import { SUBSCRIPTION_CONFIG } from '@/config/subscription-config'

import {
  EmailButton,
  EmailCard,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface NewUserWelcomeEmailProps {
  userName?: string | null
  upgradeUrl: string
}

export const NewUserWelcomeEmail = ({
  userName,
  upgradeUrl,
}: NewUserWelcomeEmailProps) => (
  <EmailWrapper previewText="Your training companion is ready">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Welcome to Hypro, ${userName}!` : 'Welcome to Hypro!'}
      </EmailHeading>

      <EmailText>You're all set to start training.</EmailText>

      <EmailText weight="600">With your free account, you can:</EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
        • Browse workout plans
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
        • Track your sessions
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
        • Log exercises
      </EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          Want the complete experience? Full access unlocks:
        </EmailText>
        <EmailBenefitsTable
          items={[
            ...PREMIUM_BENEFITS_EMAIL,
            `${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS}-day free trial to try everything`,
          ]}
        />
      </EmailCard>

      <EmailButton href={upgradeUrl}>See Full Access Options</EmailButton>

      <EmailText size="14px" color="muted">
        Train hard,
        <br />
        The Hypro Team
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)

function EmailBenefitsTable({ items }: { items: readonly string[] }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      <tbody>
        {items.map((item, idx) => (
          <tr key={`${idx}-${item}`}>
            <td
              style={{
                width: '14px',
                paddingRight: '10px',
                verticalAlign: 'top',
                color: '#71717a',
                lineHeight: '20px',
              }}
            >
              •
            </td>
            <td
              style={{
                paddingBottom: idx === items.length - 1 ? undefined : '8px',
                color: '#71717a',
                lineHeight: '20px',
                fontSize: '14px',
              }}
            >
              {item}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
