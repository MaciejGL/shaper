'use client'

import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  MessageSquare,
  RulerIcon,
  WeightIcon,
} from 'lucide-react'
import Image from 'next/image'
import { use } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
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
import { useGetClientByIdQuery } from '@/generated/graphql-client'
import { getAvatar } from '@/lib/get-avatar'

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data } = useGetClientByIdQuery({
    id,
  })

  const client = data?.userPublic

  const age = client?.birthday
    ? new Date().getFullYear() - new Date(client.birthday).getFullYear()
    : null

  if (!client) return null

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

      <AnimatedPageTransition id="client-detail-page">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Info Card */}
          <Card className="lg:col-spans-1">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto relative h-24 w-24 rounded-full overflow-hidden mb-2">
                <Image
                  src={getAvatar(client.sex, client.image)}
                  alt={`${client.firstName} ${client.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              <CardTitle className="text-xl">
                {client.firstName} {client.lastName}
              </CardTitle>
              <CardDescription>{client.email}</CardDescription>
              <CardDescription>{client.phone}</CardDescription>
              <CardDescription className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <WeightIcon className="h-4 w-4" />
                  {client.currentWeight} kg
                </div>
                <div className="flex items-center gap-2">
                  <RulerIcon className="h-4 w-4" />
                  {client.height} cm
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {age ? `${age} years old` : ''}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Current Plan:</span>
                  {/* <span className="ml-1">{client.plan}</span> */}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Start Date:</span>
                  {/* <span className="ml-1">{formatDate(client.startDate)}</span> */}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Next Session:</span>
                  {/* <span className="ml-1">{formatDate(client.nextSession)}</span> */}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Last Active:</span>
                  {/* <span className="ml-1">{client.lastActive}</span> */}
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  {/* <span>{client.progress}%</span> */}
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="pt-2">
                <h4 className="font-medium mb-2">Goals</h4>
                <ul className="space-y-1 text-sm">
                  {/* {client.goals.map((goal, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{goal}</span>
                  </li>
                ))} */}
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="font-medium mb-2">Notes</h4>
                {/* <p className="text-sm">{client.notes}</p> */}
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
                  <TabsTrigger value="active-plan">Active Plan</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="active-plan" className="space-y-4">
                  <h3 className="font-medium">Active Plan</h3>
                </TabsContent>

                <TabsContent
                  value="progress"
                  className="space-y-4"
                ></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AnimatedPageTransition>
    </div>
  )
}
