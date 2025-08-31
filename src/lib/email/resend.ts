import { Resend } from 'resend'

// Initialize Resend client
const resendClient = new Resend(process.env.RESEND_API_KEY)

// Check if we should send emails or just log them
const shouldSendEmails =
  process.env.NODE_ENV === 'production' || process.env.SEND_EMAILS === 'true'

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
        // Send real email in production or when explicitly enabled
        return await resendClient.emails.send(emailData)
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
