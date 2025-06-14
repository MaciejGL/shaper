// lib/email/send-email.ts
import { render } from '@react-email/render'

import { resend } from './resend'
import { OtpEmail } from './templates/otp-email'

const NO_REPLY_EMAIL = 'noreply@fit-space.app'
const NO_REPLY_NAME = 'Fitspace'

const FROM_EMAIL = `${NO_REPLY_NAME} <${NO_REPLY_EMAIL}>`

export const sendEmail = {
  otp: async (to: string, otp: string) => {
    const html = await render(<OtpEmail code={otp} />)

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Fitspace Login Code',
      html,
    })
  },
}
