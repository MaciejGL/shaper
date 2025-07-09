'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GQLCollaborationPermission } from '@/generated/graphql-client'

const addCollaboratorSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  permission: z.nativeEnum(GQLCollaborationPermission),
})

type AddCollaboratorFormData = z.infer<typeof addCollaboratorSchema>

interface AddCollaboratorFormProps {
  onSubmit: (email: string, permission: GQLCollaborationPermission) => void
}

export function AddCollaboratorForm({ onSubmit }: AddCollaboratorFormProps) {
  const form = useForm<AddCollaboratorFormData>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: {
      email: '',
      permission: GQLCollaborationPermission.View,
    },
  })

  const handleSubmit = (data: AddCollaboratorFormData) => {
    onSubmit(data.email, data.permission)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trainer Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  placeholder="trainer@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permission Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={GQLCollaborationPermission.View}>
                    View - Can view the plan
                  </SelectItem>
                  <SelectItem value={GQLCollaborationPermission.Edit}>
                    Edit - Can view and modify the plan
                  </SelectItem>
                  <SelectItem value={GQLCollaborationPermission.Admin}>
                    Admin - Can view, modify, and manage collaborators
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Add Collaborator
        </Button>
      </form>
    </Form>
  )
}
