import { Resend } from 'resend'

// Initialize Resend client
const resendClient = new Resend(process.env.RESEND_API_KEY)

// Check if we should send emails or just log them
const shouldSendEmails =
  process.env.NODE_ENV === 'production' || process.env.SEND_EMAILS === 'true'

// Development email override - all emails go to this address in dev
const DEV_EMAIL_OVERRIDE = process.env.EMAIL_OVERRIDE || 'test@example.com'

// Email wrapper that logs in development instead of sending
export const resend = {
  emails: {
    send: async (emailData: {
      from: string
      to: string | string[]
      subject: string
      html: string
      forceSend?: boolean
    }) => {
      if (shouldSendEmails) {
        // In development, override recipient to test email
        const isDevelopment = process.env.NODE_ENV !== 'production'
        const originalTo = emailData.to
        const finalTo = isDevelopment ? DEV_EMAIL_OVERRIDE : emailData.to

        if (isDevelopment && originalTo !== DEV_EMAIL_OVERRIDE) {
          console.info(
            `📧 Development mode: Email redirected from ${Array.isArray(originalTo) ? originalTo.join(', ') : originalTo} to ${DEV_EMAIL_OVERRIDE}`,
          )
        }

        // Send real email (with overridden recipient in dev)
        return await resendClient.emails.send({
          ...emailData,
          to: finalTo,
        })
      } else {
        // Log email in development
        console.info('📧 Email would be sent:', {
          from: emailData.from,
          to: emailData.to,
          subject: emailData.subject,
          htmlLength: emailData.html.length,
          timestamp: new Date().toISOString(),
        })

        // Return a mock response similar to Resend's response structure
        return {
          data: {
            id: `mock_${Date.now()}`,
            from: emailData.from,
            to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
            created_at: new Date().toISOString(),
          },
          error: null,
        }
      }
    },
  },
}
