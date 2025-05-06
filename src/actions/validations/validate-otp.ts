import { z } from 'zod'

const FormSchemaEmail = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
})

export async function email(formData: FormData) {
  const validatedFields = FormSchemaEmail.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  return { email }
}

const FormSchemaOtp = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 digits.' }),
})

export async function otp(formData: FormData) {
  const validatedFields = FormSchemaOtp.safeParse({
    otp: formData.get('otp'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { otp } = validatedFields.data

  return { otp }
}
