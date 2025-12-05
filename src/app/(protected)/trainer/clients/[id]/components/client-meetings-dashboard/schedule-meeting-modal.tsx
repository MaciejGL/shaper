'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, MessageCircle, Phone, Video } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { DatePicker } from '@/components/date-picker'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  GQLLocationType,
  GQLMeetingType,
  GQLVirtualMethod,
  useCreateMeetingMutation,
  useGetTraineeMeetingsQuery,
} from '@/generated/graphql-client'

interface ScheduleMeetingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  traineeId: string
  traineeName: string
  traineePhone?: string | null
  serviceDeliveryId?: string
}

const scheduleMeetingSchema = z
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
    virtualMethod: z
      .enum(['VIDEO_CALL', 'PHONE', 'WHATSAPP', 'OTHER'])
      .optional(),
    address: z.string().optional(),
    meetingLink: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // If VIRTUAL with VIDEO_CALL, meeting link is required
      if (
        data.locationType === 'VIRTUAL' &&
        data.virtualMethod === 'VIDEO_CALL'
      ) {
        return !!data.meetingLink && data.meetingLink.trim().length > 0
      }
      return true
    },
    {
      message: 'Meeting link is required for video calls',
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

type ScheduleMeetingFormValues = z.infer<typeof scheduleMeetingSchema>

export function ScheduleMeetingModal({
  open,
  onOpenChange,
  traineeId,
  traineeName,
  traineePhone,
  serviceDeliveryId,
}: ScheduleMeetingModalProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateMeetingMutation()
  const queryKey = useGetTraineeMeetingsQuery.getKey({ traineeId })

  // Get default time (next hour, or 10:00 if in the past)
  const getDefaultTime = () => {
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(now.getHours() + 1, 0, 0, 0)

    // If it's past 9 PM, default to 10:00 AM tomorrow
    if (nextHour.getHours() >= 21) {
      return '10:00'
    }

    return nextHour.toTimeString().slice(0, 5) // Format as HH:MM
  }

  const form = useForm<ScheduleMeetingFormValues>({
    resolver: zodResolver(scheduleMeetingSchema),
    defaultValues: {
      title: '',
      type: 'INITIAL_CONSULTATION',
      scheduledDate: undefined,
      scheduledTime: getDefaultTime(),
      duration: '60',
      locationType: 'VIRTUAL' as const,
      virtualMethod: 'VIDEO_CALL' as const,
      address: '',
      meetingLink: '',
      description: '',
    },
  })

  const locationType = form.watch('locationType')
  const virtualMethod = form.watch('virtualMethod')
  const scheduledDate = form.watch('scheduledDate')

  const onSubmit = async (values: ScheduleMeetingFormValues) => {
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
          : GQLLocationType.CoachLocation // Physical meetings default to coach location

      // Map virtual method to backend enum
      const backendVirtualMethod =
        values.locationType === 'VIRTUAL' && values.virtualMethod
          ? (values.virtualMethod as GQLVirtualMethod)
          : null

      await createMutation.mutateAsync({
        input: {
          traineeId,
          type: values.type as GQLMeetingType,
          scheduledAt: scheduledDateTime.toISOString(),
          duration: parseInt(values.duration),
          timezone,
          locationType: backendLocationType,
          virtualMethod: backendVirtualMethod,
          address: values.address || null,
          meetingLink: values.meetingLink || null,
          title: values.title,
          description: values.description || null,
          serviceDeliveryId: serviceDeliveryId || null,
        },
      })

      await queryClient.invalidateQueries({ queryKey })
      toast.success('Meeting scheduled successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('Failed to schedule meeting')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        dialogTitle={`Schedule Meeting with ${traineeName}`}
      >
        <DialogHeader>
          <DialogTitle>Schedule Meeting with {traineeName}</DialogTitle>
          <DialogDescription>
            Create a new meeting. The client will be notified and can confirm.
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
                      <SelectTrigger variant="outline">
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
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Reset virtual method when switching location type
                      if (value === 'VIRTUAL') {
                        form.setValue('virtualMethod', 'VIDEO_CALL')
                      }
                    }}
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

            {/* Virtual Method (for virtual meetings) */}
            {locationType === 'VIRTUAL' && (
              <FormField
                control={form.control}
                name="virtualMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Virtual Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VIDEO_CALL">
                          <div className="flex items-center gap-2">
                            <Video className="size-4" />
                            Video Call
                          </div>
                        </SelectItem>
                        <SelectItem value="PHONE">
                          <div className="flex items-center gap-2">
                            <Phone className="size-4" />
                            Phone Call
                          </div>
                        </SelectItem>
                        <SelectItem value="WHATSAPP">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="size-4" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="OTHER">
                          <div className="flex items-center gap-2">Other</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Client Phone Display (for phone/whatsapp) */}
            {locationType === 'VIRTUAL' &&
              (virtualMethod === 'PHONE' || virtualMethod === 'WHATSAPP') && (
                <Alert variant={traineePhone ? 'default' : 'warning'}>
                  {traineePhone ? (
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {traineeName}&apos;s phone:
                      </span>
                      <a
                        href={`tel:${traineePhone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {traineePhone}
                      </a>
                    </AlertDescription>
                  ) : (
                    <AlertDescription className="flex items-center gap-2">
                      <AlertCircle className="size-4" />
                      {traineeName} hasn&apos;t provided their phone number
                    </AlertDescription>
                  )}
                </Alert>
              )}

            {/* Meeting Link (for video calls) */}
            {locationType === 'VIRTUAL' && virtualMethod === 'VIDEO_CALL' && (
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
                Schedule Meeting
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
