import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  MessageSquare,
} from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// This would normally come from a database
const getClientById = (id: string) => {
  // Mock client data
  return {
    id,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 123-4567',
    image: '/avatar-female.png',
    plan: 'Weight Loss Program',
    startDate: '2023-10-15',
    nextSession: '2023-11-10',
    progress: 75,
    status: 'active',
    lastActive: '2 hours ago',
    goals: [
      'Lose 10 pounds in 3 months',
      'Improve cardiovascular endurance',
      'Develop consistent workout routine',
    ],
    notes:
      'Sarah is highly motivated but needs encouragement on difficult days. Prefers morning workouts.',
    sessions: [
      { date: '2023-10-15', type: 'Initial Assessment', completed: true },
      { date: '2023-10-22', type: 'Cardio + Strength', completed: true },
      { date: '2023-10-29', type: 'HIIT Training', completed: true },
      { date: '2023-11-05', type: 'Progress Check', completed: false },
      { date: '2023-11-10', type: 'Cardio + Strength', completed: false },
    ],
    measurements: {
      weight: [
        { date: '2023-10-15', value: 165 },
        { date: '2023-10-22', value: 163 },
        { date: '2023-10-29', value: 161 },
      ],
      bodyFat: [
        { date: '2023-10-15', value: 28 },
        { date: '2023-10-29', value: 27 },
      ],
    },
  }
}

export default function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const client = getClientById(params.id)

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <ButtonLink
          variant="ghost"
          href="/trainer/clients"
          iconStart={<ArrowLeft className="h-4 w-4" />}
        >
          Clients
        </ButtonLink>
        <h1 className="text-2xl font-bold">Client Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto relative h-24 w-24 rounded-full overflow-hidden mb-2">
              <Image
                src={client.image || '/avatar-female.png'}
                alt={client.name}
                fill
                className="object-cover"
              />
            </div>
            <CardTitle className="text-xl">{client.name}</CardTitle>
            <CardDescription>{client.email}</CardDescription>
            <CardDescription>{client.phone}</CardDescription>
            <Badge
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className="mt-2 capitalize"
            >
              {client.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pt-4 space-y-2">
              <div className="flex items-center text-sm">
                <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Current Plan:</span>
                <span className="ml-1">{client.plan}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Start Date:</span>
                <span className="ml-1">{formatDate(client.startDate)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Next Session:</span>
                <span className="ml-1">{formatDate(client.nextSession)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Last Active:</span>
                <span className="ml-1">{client.lastActive}</span>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span>{client.progress}%</span>
              </div>
              <Progress value={client.progress} className="h-2" />
            </div>

            <div className="pt-2">
              <h4 className="font-medium mb-2">Goals</h4>
              <ul className="space-y-1 text-sm">
                {client.goals.map((goal, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm">{client.notes}</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                variant="outline"
                iconStart={<MessageSquare className="mr-2 h-4 w-4" />}
              >
                Message
              </Button>
              <Button
                className="flex-1"
                iconStart={<Calendar className="mr-2 h-4 w-4" />}
              >
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Details Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sessions">
              <TabsList className="mb-4 dark:bg-primary-foreground">
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="plans">Training Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="space-y-4">
                <h3 className="font-medium">Upcoming & Recent Sessions</h3>
                <div className="space-y-2">
                  {client.sessions.map((session, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border flex justify-between items-center ${
                        session.completed ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium">{session.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.date)}
                        </p>
                      </div>
                      <Badge
                        variant={session.completed ? 'outline' : 'default'}
                      >
                        {session.completed ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button>Add New Session</Button>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Weight Progress</h3>
                    <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Weight chart visualization would go here
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {client.measurements.weight.map((measurement, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>{formatDate(measurement.date)}</span>
                          <span className="font-medium">
                            {measurement.value} lbs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Body Fat Percentage</h3>
                    <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Body fat chart visualization would go here
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {client.measurements.bodyFat.map((measurement, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>{formatDate(measurement.date)}</span>
                          <span className="font-medium">
                            {measurement.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Add Measurement</Button>
                </div>
              </TabsContent>

              <TabsContent value="plans" className="space-y-4">
                <div className="p-4 rounded-md border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Weight Loss Program</h3>
                      <p className="text-sm text-muted-foreground">
                        Active plan • Started {formatDate(client.startDate)}
                      </p>
                    </div>
                    <Badge>Current</Badge>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span>{client.progress}%</span>
                    </div>
                    <Progress value={client.progress} className="h-2" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Plan
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-md border bg-muted/30">
                  <h3 className="font-medium">Previous Plans</h3>
                  <p className="text-sm text-muted-foreground">
                    No previous plans found
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button>Assign New Plan</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
