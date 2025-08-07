import { ArrowRightIcon, MailIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { emailValidation } from '@/utils/validation'

interface EmailFormProps {
  email: string
  isLoading: boolean
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
}

export function EmailForm({
  email,
  isLoading,
  onEmailChange,
  onSubmit,
}: EmailFormProps) {
  return (
    <form className="flex flex-col gap-4">
      <Input
        id="email"
        value={email}
        variant="secondary"
        onChange={onEmailChange}
        autoFocus
        placeholder="name@example.com"
        iconStart={<MailIcon />}
        label="Email"
      />
      <Button
        type="submit"
        loading={isLoading}
        onClick={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        disabled={!emailValidation(email)}
        iconEnd={<ArrowRightIcon />}
      >
        Send Code
      </Button>
    </form>
  )
}
