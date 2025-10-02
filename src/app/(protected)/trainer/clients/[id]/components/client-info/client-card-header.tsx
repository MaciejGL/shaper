import Image from 'next/image'

import { CardDescription, CardTitle } from '@/components/ui/card'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'
import { getAvatar } from '@/lib/get-avatar'

export function ClientCardHeader({
  client,
  clientName,
}: {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
}) {
  return (
    <div className="text-center pb-2">
      <div className="mx-auto relative h-24 w-24 rounded-full overflow-hidden mb-2">
        <Image
          src={getAvatar(client.sex, client.image)}
          alt={clientName ?? ''}
          fill
          className="object-cover"
        />
      </div>
      <CardTitle className="text-lg">{clientName}</CardTitle>
      <CardDescription>{client.email}</CardDescription>
      <CardDescription>{client.phone}</CardDescription>
    </div>
  )
}
