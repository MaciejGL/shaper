import { z } from 'zod'

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters.' }),
})

export function validateNewRequest(fields: {
  email?: string
  message?: string
}) {
  const validatedFields = FormSchema.safeParse({
    email: fields.email,
    message: fields.message,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, message } = validatedFields.data

  return { email, message }
}
