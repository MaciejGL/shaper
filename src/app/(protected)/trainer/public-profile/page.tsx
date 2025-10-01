'use client'

import { format } from 'date-fns'
import { CalendarIcon, EyeIcon, PlusIcon, User, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { TrainerCard, TrainerData } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useUpdateTrainerCapacityMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { DashboardHeader } from '../components/dashboard-header'

export default function PublicProfilePage() {
  const { data: profileData, isLoading } = useProfileQuery()
  const updateProfileMutation = useUpdateProfileMutation()
  const updateCapacityMutation = useUpdateTrainerCapacityMutation()

  const [bio, setBio] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])
  const [credentials, setCredentials] = useState<string[]>([])
  const [successStories, setSuccessStories] = useState<string[]>([])
  const [trainerSince, setTrainerSince] = useState<Date | undefined>()
  const [capacity, setCapacity] = useState<number | null>(null)

  const [newSpecialization, setNewSpecialization] = useState('')
  const [newCredential, setNewCredential] = useState('')
  const [newSuccessStory, setNewSuccessStory] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showExample, setShowExample] = useState(false)

  // Initialize form with existing data
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile
      setBio(profile.bio || '')
      setSpecializations(profile.specialization || [])
      setCredentials(profile.credentials || [])
      setSuccessStories(profile.successStories || [])
      setTrainerSince(
        profile.trainerSince ? new Date(profile.trainerSince) : undefined,
      )
    }

    if (profileData?.userBasic) {
      setCapacity(profileData.userBasic.capacity || null)
    }
  }, [profileData])

  const addSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !specializations.includes(newSpecialization.trim())
    ) {
      setSpecializations([...specializations, newSpecialization.trim()])
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index))
  }

  const addCredential = () => {
    if (newCredential.trim() && !credentials.includes(newCredential.trim())) {
      setCredentials([...credentials, newCredential.trim()])
      setNewCredential('')
    }
  }

  const removeCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index))
  }

  const addSuccessStory = () => {
    if (
      newSuccessStory.trim() &&
      !successStories.includes(newSuccessStory.trim())
    ) {
      setSuccessStories([...successStories, newSuccessStory.trim()])
      setNewSuccessStory('')
    }
  }

  const removeSuccessStory = (index: number) => {
    setSuccessStories(successStories.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      // Save profile data and capacity in parallel
      await Promise.all([
        updateProfileMutation.mutateAsync({
          input: {
            bio,
            specialization: specializations,
            credentials,
            successStories,
            trainerSince: trainerSince?.toISOString(),
          },
        }),
        updateCapacityMutation.mutateAsync({
          input: {
            capacity,
          },
        }),
      ])
      toast.success('Public profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Create preview data
  const previewData = {
    id: 'preview',
    name:
      profileData?.profile?.firstName && profileData?.profile?.lastName
        ? `${profileData.profile.firstName} ${profileData.profile.lastName}`
        : null,
    role: 'TRAINER' as const,
    clientCount: 12, // Mock data for preview
    email: 'example@example.com', // Mock is not used in the app
    capacity,
    spotsLeft: capacity ? capacity - 12 : null,
    isAtCapacity: capacity ? capacity - 12 <= 0 : false,
    profile: {
      firstName: profileData?.profile?.firstName,
      lastName: profileData?.profile?.lastName,
      bio,
      avatarUrl: profileData?.profile?.avatarUrl,
      specialization: specializations,
      credentials,
      successStories,
      trainerSince: trainerSince?.toISOString(),
    },
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Public Profile Management"
          description="Manage your public profile and how it appears to clients"
          icon={User}
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowExample(!showExample)}
            iconStart={<EyeIcon />}
          >
            {showExample ? 'Hide Example' : 'Show Example'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
            iconStart={<EyeIcon />}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={handleSave}
            loading={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">{renderEditForm()}</div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <div className="max-w-md">
          <TrainerCard
            trainer={previewData}
            onClick={() => setShowPreview(true)}
            showClientCount={false}
          />
        </div>

        <TrainerDetailsDrawer
          direction="right"
          trainer={previewData}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />

        <TrainerDetailsDrawer
          direction="right"
          trainer={exampleData}
          isOpen={showExample}
          onClose={() => setShowExample(false)}
        />
      </div>
    </div>
  )

  function renderEditForm() {
    return (
      <>
        {/* Bio Section */}
        <Card borderless>
          <CardHeader>
            <CardTitle>About / Bio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>Add your bio to your profile.</CardDescription>
            <div>
              <Textarea
                label="Bio"
                id="bio"
                variant="ghost"
                placeholder="Example: I'm a personal trainer with 10 years of experience. I specialize in strength training and functional training."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trainer Since Section */}
        <Card borderless>
          <CardHeader>
            <CardTitle>Training Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add the year you started training clients.
            </CardDescription>
            <div className="space-y-2">
              <Label>Trainer Since</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !trainerSince && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {trainerSince ? format(trainerSince, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={trainerSince}
                    onSelect={setTrainerSince}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Client Capacity Section */}
        <Card borderless>
          <CardHeader>
            <CardTitle>Client Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Set the maximum number of clients you can manage at one time.
              Leave empty for unlimited.
            </CardDescription>
            <div className="space-y-2">
              <Label>Maximum Clients</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 20"
                value={capacity || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setCapacity(value === '' ? null : parseInt(value, 10))
                }}
                min="1"
                max="1000"
              />
              {capacity && (
                <p className="text-sm text-muted-foreground">
                  You can take on up to {capacity} clients at a time
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Specializations Section */}
        <Card borderless>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add your specializations to your profile.
              <br />
              Example: Weight Loss, Strength Training, etc.
            </CardDescription>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <Input
                id="new-specialization"
                placeholder="Add specialization (e.g., Weight Loss, Strength Training)"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && addSpecialization()}
                className="min-w-max"
              />
              <Button
                size="icon-sm"
                onClick={addSpecialization}
                iconOnly={<PlusIcon />}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  size="lg"
                  className="gap-2 cursor-pointer"
                  onClick={() => removeSpecialization(index)}
                >
                  {spec}
                  <XIcon className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credentials Section */}
        <Card borderless>
          <CardHeader>
            <CardTitle>Credentials & Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add your credentials and certifications to your profile.
              <br />
              - NASM-CPT(Certified Personal Trainer)
              <br />- CSCS(Certified Strength and Conditioning Specialist) etc.
            </CardDescription>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <Input
                id="new-credential"
                placeholder="Add credential (e.g., NASM-CPT, CSCS)"
                value={newCredential}
                onChange={(e) => setNewCredential(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCredential()}
              />
              <Button onClick={addCredential} size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {credentials.map((credential, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  size="lg"
                  className="gap-2 cursor-pointer"
                  onClick={() => removeCredential(index)}
                >
                  {credential}
                  <XIcon className="h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Stories Section */}
        <Card borderless>
          <CardHeader>
            <CardTitle>Success Stories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add your success stories to your profile.
              <br />
              <br />
              Example:
              <br />
              Busy parent: -10 kg in 14 weeks, no crash dieting
              <br />
              Desk worker: shoulder pain → pain-free press in 8 weeks
              <br />
              Hypertrophy: arm +3.2 cm in 10 weeks
              <br />
              Endurance: 10K 50:00 → 44:30 in 12 weeks
              <br />
              Rehab: ACL—return to sport in 5 months
            </CardDescription>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <Textarea
                id="new-success-story"
                placeholder="Add a success story (e.g., Helped client lose 30lbs in 6 months)"
                variant="ghost"
                value={newSuccessStory}
                onChange={(e) => setNewSuccessStory(e.target.value)}
                rows={2}
              />
              <Button
                onClick={addSuccessStory}
                size="sm"
                className="self-start"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {successStories.map((story, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                >
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm flex-1">{story}</p>
                  <XIcon
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => removeSuccessStory(index)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    )
  }
}

const exampleData: TrainerData = {
  id: 'example',
  name: 'Sarah Mitchell',
  role: 'TRAINER',
  clientCount: 15,
  email: 'sarah.mitchell@example.com',
  capacity: 20,
  spotsLeft: 5,
  isAtCapacity: false,
  profile: {
    firstName: 'Sarah',
    lastName: 'Mitchell',
    bio: `Hi! I'm Sarah, and I've been helping people transform their lives through fitness for over 8 years. What drives me is seeing that moment when someone realizes they're stronger than they ever thought possible.

I believe fitness should fit into your life, not take it over. Whether you're a busy parent squeezing workouts between meetings, recovering from an injury, or training for your first marathon, I'll meet you exactly where you are and help you get where you want to go.

My approach is simple: we start with what works for YOU. No cookie-cutter programs or unrealistic expectations. Just proven methods, steady progress, and plenty of support along the way. I've helped everyone from complete beginners to competitive athletes, and I'd love to help you too.

Ready to surprise yourself with what you can achieve?`,
    trainerSince: '2016-03-15T00:00:00.000Z',
    specialization: [
      'Weight Loss',
      'Strength Training',
      'Functional Movement',
      'Nutrition Coaching',
      'Athletic Performance',
      'Injury Prevention',
    ],
    credentials: [
      'NASM-CPT (Certified Personal Trainer)',
      'CSCS (Certified Strength & Conditioning Specialist)',
      'Precision Nutrition Level 1',
      'FMS Level 2 (Functional Movement Screen)',
      'CPR/AED Certified',
      'TRX Suspension Training Certified',
    ],
    successStories: [
      'Busy executive mom: Lost 25 lbs and gained incredible energy while working 60+ hour weeks. She now deadlifts her body weight and says she feels stronger at 42 than she did at 25!',
      'College soccer player: Came back from ACL surgery stronger than ever. Not only returned to varsity play in 6 months, but jumped 8% higher and became team captain.',
      'New mom: Healed postpartum body separation, lost 30 lbs, and regained core strength. She went from struggling to lift her toddler to doing pull-ups for the first time in her life.',
      'Software developer: Eliminated chronic back pain that had bothered him for years. Now pain-free and loves showing off his new deadlift PR to his coworkers.',
      "Active grandmother: At 68, she's stronger and more balanced than women half her age. Her doctor was amazed at her bone density improvements and mobility gains.",
      'Competitive powerlifter: Added 85 lbs to his deadlift while staying injury-free. He credits our mobility work for his biggest strength gains in years.',
    ],
    avatarUrl: null,
  },
}
