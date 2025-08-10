'use client'

import {
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useMyCoachingRequestsQuery,
  useUserBasicQuery,
} from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

export default function MyTrainerPage() {
  const { data: userData } = useUserBasicQuery()
  const { data: requestsData } = useMyCoachingRequestsQuery()

  const user = userData?.userBasic
  const coachingRequests = requestsData?.coachingRequests || []

  // Filter for accepted requests (this means we have a trainer relationship)
  const acceptedRequests = coachingRequests.filter(
    (request) => request.status === 'ACCEPTED',
  )

  // Check if user has a trainer relationship
  const hasTrainer = acceptedRequests.length > 0

  return (
    <div className="container-hypertro mx-auto mb-24 max-w-md">
      <DashboardHeader title="My Trainer" icon={UserCheck} />

      {hasTrainer ? (
        <TrainerRelationshipView requests={acceptedRequests} />
      ) : (
        <NoTrainerView requests={coachingRequests} />
      )}
    </div>
  )
}

interface TrainerRelationshipViewProps {
  requests: any[]
}

function TrainerRelationshipView({ requests }: TrainerRelationshipViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Use request data for trainer info
  const trainerInfo = requests[0]?.recipient

  return (
    <div className="space-y-6">
      {/* Trainer Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold">
                {trainerInfo?.name || 'Your Trainer'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {trainerInfo?.email}
              </p>
              <Badge className="mt-2" variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communication">Messages</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab trainer={trainerInfo} />
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <CommunicationTab trainer={trainerInfo} />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ProgressTab trainer={trainerInfo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OverviewTab({ trainer }: { trainer: any }) {
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3">
              <div className="flex flex-col items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Send Message</span>
              </div>
            </Button>

            <Button variant="outline" size="sm" className="h-auto p-3">
              <div className="flex flex-col items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Schedule Session</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trainer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trainer Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{trainer?.email || 'Not available'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Response time: Usually within 24 hours</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Training Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            No training plan assigned yet. Your trainer will create a
            personalized plan for you soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function CommunicationTab({ trainer }: { trainer: any }) {
  return (
    <div className="space-y-4">
      {/* Communication Placeholder */}
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          In-app messaging system is coming soon! For now, you can reach your
          trainer at {trainer?.email}
        </AlertDescription>
      </Alert>

      {/* Message History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message History</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">
              Your conversation history will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled
          >
            "I completed today's workout"
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled
          >
            "I have a question about my program"
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled
          >
            "Can we reschedule our session?"
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ProgressTab({ trainer }: { trainer: any }) {
  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No progress data yet
            </p>
            <p className="text-xs text-muted-foreground">
              Your progress tracking will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shared Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shared with Trainer</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            Your trainer can view your workout logs, body measurements, and
            progress photos when you share them.
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Workout Logs</span>
              <Badge variant="outline">Auto-shared</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Body Measurements</span>
              <Badge variant="secondary">Private</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Progress Photos</span>
              <Badge variant="secondary">Private</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface NoTrainerViewProps {
  requests: any[]
}

function NoTrainerView({ requests }: NoTrainerViewProps) {
  const pendingRequests = requests.filter(
    (request) => request.status === 'PENDING',
  )
  const rejectedRequests = requests.filter(
    (request) => request.status === 'REJECTED',
  )

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardContent className="p-6 text-center">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

          {pendingRequests.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-2">Request Pending</h2>
              <p className="text-sm text-muted-foreground mb-4">
                You have sent a coaching request. The trainer will review and
                respond soon.
              </p>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Waiting for response
              </Badge>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">
                No Trainer Connected
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't connected with a trainer yet. Explore our featured
                trainers to find the perfect match for your fitness goals.
              </p>
              <Button className="mt-2">
                <Users className="h-4 w-4 mr-2" />
                Find a Trainer
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">
                    {request.recipient?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.recipient?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      {rejectedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {rejectedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">
                    {request.recipient?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.recipient?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="destructive">Declined</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
