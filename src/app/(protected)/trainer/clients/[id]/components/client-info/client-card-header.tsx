import { Calendar } from 'lucide-react'
import { RulerIcon } from 'lucide-react'
import { WeightIcon } from 'lucide-react'
import Image from 'next/image'

import { CardDescription, CardTitle } from '@/components/ui/card'
import { CardHeader } from '@/components/ui/card'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'
import { getAvatar } from '@/lib/get-avatar'

export function ClientCardHeader({
  client,
  clientName,
}: {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
}) {
  const age = client.birthday
    ? new Date().getFullYear() - new Date(client.birthday).getFullYear()
    : null

  return (
    <CardHeader className="text-center pb-2">
      <div className="mx-auto relative h-24 w-24 rounded-full overflow-hidden mb-2">
        <Image
          src={getAvatar(client.sex, client.image)}
          alt={clientName ?? ''}
          fill
          className="object-cover"
        />
      </div>
      <CardTitle className="text-xl">{clientName}</CardTitle>
      <CardDescription>{client.email}</CardDescription>
      <CardDescription>{client.phone}</CardDescription>
      <CardDescription className="flex flex-wrap justify-center gap-4">
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
  )
}
