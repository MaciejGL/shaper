'use client'

import { Award, Clock, Edit, Eye, Save, Star, User } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { DashboardHeader } from '../components/dashboard-header'

export default function TrainerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    specialization: 'Strength Training & Nutrition',
    experience: '5+ years',
    bio: 'Certified personal trainer specializing in strength training and sports nutrition. I help clients build sustainable fitness habits and achieve their body composition goals through evidence-based programming.',
    credentials: ['NASM-CPT', 'Precision Nutrition Level 1', 'FMS Level 2'],
    successStories: [
      'Helped 50+ clients lose weight sustainably',
      'Trained 3 competitive powerlifters to state championships',
      'Specialized in postpartum fitness recovery',
    ],
    availability: 'Mon-Fri: 6AM-8PM, Sat: 8AM-2PM',
    hourlyRate: 75,
    isAvailableForNewClients: true,
  })

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addCredential = () => {
    const newCredential = prompt('Enter new credential:')
    if (newCredential?.trim()) {
      setFormData((prev) => ({
        ...prev,
        credentials: [...prev.credentials, newCredential.trim()],
      }))
    }
  }

  const removeCredential = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index),
    }))
  }

  const addSuccessStory = () => {
    const newStory = prompt('Enter new success story:')
    if (newStory?.trim()) {
      setFormData((prev) => ({
        ...prev,
        successStories: [...prev.successStories, newStory.trim()],
      }))
    }
  }

  const removeSuccessStory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      successStories: prev.successStories.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <DashboardHeader
        title="Trainer Profile"
        icon={User}
        action={
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        }
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="preview">Marketplace Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileEditView
            formData={formData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onAddCredential={addCredential}
            onRemoveCredential={removeCredential}
            onAddSuccessStory={addSuccessStory}
            onRemoveSuccessStory={removeSuccessStory}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <ProfilePreview formData={formData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ProfileEditViewProps {
  formData: any
  isEditing: boolean
  onInputChange: (field: string, value: any) => void
  onAddCredential: () => void
  onRemoveCredential: (index: number) => void
  onAddSuccessStory: () => void
  onRemoveSuccessStory: (index: number) => void
}

function ProfileEditView({
  formData,
  isEditing,
  onInputChange,
  onAddCredential,
  onRemoveCredential,
  onAddSuccessStory,
  onRemoveSuccessStory,
}: ProfileEditViewProps) {
  return (
    <div className="space-y-6">
      {/* Availability Status */}
      <Alert>
        <Star className="h-4 w-4" />
        <AlertDescription>
          {formData.isAvailableForNewClients
            ? 'Your profile is visible in the marketplace and accepting new clients.'
            : "Your profile is hidden from the marketplace. You're not accepting new clients."}
        </AlertDescription>
      </Alert>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              {isEditing ? (
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) =>
                    onInputChange('specialization', e.target.value)
                  }
                  placeholder="e.g., Strength Training & Nutrition"
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded">
                  {formData.specialization}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="experience">Experience</Label>
              {isEditing ? (
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => onInputChange('experience', e.target.value)}
                  placeholder="e.g., 5+ years"
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded">
                  {formData.experience}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => onInputChange('bio', e.target.value)}
                placeholder="Describe your background, approach, and what makes you unique..."
                rows={4}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">{formData.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Credentials & Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.credentials.map((credential: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="relative group"
                >
                  {credential}
                  {isEditing && (
                    <button
                      onClick={() => onRemoveCredential(index)}
                      className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>

            {isEditing && (
              <Button variant="outline" size="sm" onClick={onAddCredential}>
                <Award className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Success Stories & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ul className="space-y-2">
              {formData.successStories.map((story: string, index: number) => (
                <li key={index} className="flex items-start gap-2 group">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm flex-1">{story}</span>
                  {isEditing && (
                    <button
                      onClick={() => onRemoveSuccessStory(index)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {isEditing && (
              <Button variant="outline" size="sm" onClick={onAddSuccessStory}>
                <Star className="h-4 w-4 mr-2" />
                Add Success Story
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Availability & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Availability & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="availability">Availability Schedule</Label>
            {isEditing ? (
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => onInputChange('availability', e.target.value)}
                placeholder="e.g., Mon-Fri: 6AM-8PM, Sat: 8AM-2PM"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                <Clock className="h-4 w-4" />
                {formData.availability}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
            {isEditing ? (
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) =>
                  onInputChange('hourlyRate', parseInt(e.target.value))
                }
                placeholder="75"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                ${formData.hourlyRate}/hour
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailableForNewClients}
                onChange={(e) =>
                  onInputChange('isAvailableForNewClients', e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isAvailable">Available for new clients</Label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfilePreview({ formData }: { formData: any }) {
  return (
    <div className="space-y-6">
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          This is how your profile will appear to potential clients in the
          marketplace.
        </AlertDescription>
      </Alert>

      {/* Preview Card */}
      <Card className="border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Your Name</h3>
                  <p className="text-xs text-muted-foreground">
                    {formData.specialization}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.experience}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.9</span>
                  <span className="text-muted-foreground">(127)</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {formData.bio}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bio */}
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{formData.bio}</p>
          </div>

          {/* Credentials */}
          <div>
            <h3 className="font-semibold mb-2">Credentials</h3>
            <div className="flex flex-wrap gap-2">
              {formData.credentials.map((credential: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {credential}
                </Badge>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div>
            <h3 className="font-semibold mb-2">Success Stories</h3>
            <ul className="space-y-1">
              {formData.successStories.map((story: string, index: number) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {story}
                </li>
              ))}
            </ul>
          </div>

          {/* Availability */}
          <div>
            <h3 className="font-semibold mb-2">Availability</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formData.availability}
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="text-center">
            <p className="text-lg font-semibold">${formData.hourlyRate}/hour</p>
            <p className="text-sm text-muted-foreground">
              Starting rate for personal training
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
