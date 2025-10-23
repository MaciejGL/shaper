'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import {
  GQLGetTraineeMeetingsQuery,
  GQLLocationType,
  GQLMeetingType,
  useGetTraineeMeetingsQuery,
  useUpdateMeetingMutation,
} from '@/generated/graphql-client'

type Meeting = NonNullable<
  GQLGetTraineeMeetingsQuery['getTraineeMeetings']
>[number]

interface EditMeetingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting
  clientId: string
}

const editMeetingSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum([
      'INITIAL_CONSULTATION',
      'IN_PERSON_TRAINING',
      'CHECK_IN',
      'PLAN_REVIEW',
    ]),
    scheduledDate: z.date(),
    scheduledTime: z.string().min(1, 'Time is required'),
    duration: z.string().min(1, 'Duration is required'),
    locationType: z.enum(['VIRTUAL', 'IN_PERSON']),
    address: z.string().optional(),
    meetingLink: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // If VIRTUAL, meeting link is required
      if (data.locationType === 'VIRTUAL') {
        return !!data.meetingLink && data.meetingLink.trim().length > 0
      }
      return true
    },
    {
      message: 'Meeting link is required for virtual meetings',
      path: ['meetingLink'],
    },
  )
  .refine(
    (data) => {
      // If IN_PERSON, address is required
      if (data.locationType === 'IN_PERSON') {
        return !!data.address && data.address.trim().length > 0
      }
      return true
    },
    {
      message: 'Address is required for in-person meetings',
      path: ['address'],
    },
  )
  .refine(
    (data) => {
      // Validate meeting link is a valid URL if provided
      if (data.meetingLink && data.meetingLink.trim().length > 0) {
        try {
          new URL(data.meetingLink)
          return true
        } catch {
          return false
        }
      }
      return true
    },
    {
      message: 'Please enter a valid URL',
      path: ['meetingLink'],
    },
  )

type EditMeetingFormValues = z.infer<typeof editMeetingSchema>

export function EditMeetingModal({
  open,
  onOpenChange,
  meeting,
  clientId,
}: EditMeetingModalProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateMutation = useUpdateMeetingMutation()
  const queryKey = useGetTraineeMeetingsQuery.getKey({ traineeId: clientId })

  // Parse existing meeting date/time
  const meetingDate = new Date(meeting.scheduledAt)
  const existingTime = meetingDate.toTimeString().slice(0, 5) // HH:MM format

  // Determine UI location type from backend enum
  const getUILocationType = (locationType: string) => {
    return locationType === 'VIRTUAL' ? 'VIRTUAL' : 'IN_PERSON'
  }

  const form = useForm<EditMeetingFormValues>({
    resolver: zodResolver(editMeetingSchema),
    defaultValues: {
      title: meeting.title,
      type: meeting.type as GQLMeetingType,
      scheduledDate: meetingDate,
      scheduledTime: existingTime,
      duration: meeting.duration.toString(),
      locationType: getUILocationType(meeting.locationType) as
        | 'VIRTUAL'
        | 'IN_PERSON',
      address: meeting.address || '',
      meetingLink: meeting.meetingLink || '',
      description: meeting.description || '',
    },
  })

  const locationType = form.watch('locationType')
  const scheduledDate = form.watch('scheduledDate')

  const onSubmit = async (values: EditMeetingFormValues) => {
    setIsSubmitting(true)
    try {
      // Get user timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Combine date and time into ISO string
      const [hours, minutes] = values.scheduledTime.split(':')
      const scheduledDateTime = new Date(values.scheduledDate)
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Map UI location type to backend enum
      const backendLocationType: GQLLocationType =
        values.locationType === 'VIRTUAL'
          ? GQLLocationType.Virtual
          : GQLLocationType.CoachLocation

      await updateMutation.mutateAsync({
        meetingId: meeting.id,
        input: {
          type: values.type as GQLMeetingType,
          scheduledAt: scheduledDateTime.toISOString(),
          duration: parseInt(values.duration),
          timezone,
          locationType: backendLocationType,
          address: values.address || null,
          meetingLink: values.meetingLink || null,
          title: values.title,
          description: values.description || null,
        },
      })

      await queryClient.invalidateQueries({ queryKey })
      toast.success('Meeting updated successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update meeting')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        dialogTitle="Edit Meeting"
      >
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
          <DialogDescription>
            Update the meeting details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="e.g., Initial Consultation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger variant="tertiary">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INITIAL_CONSULTATION">
                        Initial Consultation
                      </SelectItem>
                      <SelectItem value="IN_PERSON_TRAINING">
                        In-Person Training
                      </SelectItem>
                      <SelectItem value="CHECK_IN">Check-In</SelectItem>
                      <SelectItem value="PLAN_REVIEW">Plan Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        dateFormat="EEE, MMM d, yyyy"
                        buttonProps={{ variant: 'tertiary' }}
                        disabled={{ before: new Date() }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        id="scheduledTime"
                        type="time"
                        {...field}
                        disabled={!scheduledDate}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Type */}
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VIRTUAL">Virtual (Online)</SelectItem>
                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Link (for virtual) */}
            {locationType === 'VIRTUAL' && (
              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link</FormLabel>
                    <FormControl>
                      <Input
                        id="meetingLink"
                        placeholder="https://meet.google.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Address (for in-person) */}
            {locationType === 'IN_PERSON' && (
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        id="address"
                        placeholder="123 Gym Street, City"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="Add any notes or agenda items for the meeting..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="tertiary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Update Meeting
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
