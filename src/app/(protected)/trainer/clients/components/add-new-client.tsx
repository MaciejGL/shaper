'use client'

import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { validateNewRequest } from '@/actions/validations/validate-new-request'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCoachingRequestMutation } from '@/generated/graphql-client'

export function AddClientModal() {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createCoachingRequest, isPending } =
    useCreateCoachingRequestMutation({
      onSuccess: () => {
        toast.success('Coaching request sent')
      },
    })
  const [errors, setErrors] = useState<{
    email?: string[]
    message?: string[]
  }>({})
  const [formData, setFormData] = useState({
    email: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }))
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { email, message, errors } = validateNewRequest(formData)

      if (errors) {
        setErrors(errors)
        return
      }

      await createCoachingRequest({
        recipientEmail: email,
        message: message,
      })

      setFormData({ email: '', message: '' })
      toast.success('Coaching request sent to client.')
      setOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Client</Button>
      </DialogTrigger>
      <DialogContent dialogTitle="Add New Client" className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Send an invitation to a new client to join your training program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-left">
                Email
              </Label>
              <Input
                error={errors.email?.[0]}
                id="email"
                name="email"
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-left">
                Invitation Message
              </Label>
              <Textarea
                error={errors.message?.[0]}
                id="message"
                name="message"
                placeholder="Write a personal message to your client..."
                value={formData.message}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
