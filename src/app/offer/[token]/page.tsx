import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

import { OfferPage } from './offer-page'

interface OfferPageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ client?: string }>
}

export default async function TrainerOfferPage({
  params,
  searchParams,
}: OfferPageProps) {
  const { token } = await params
  const awaitedSearchParams = await searchParams

  // Find the offer by token
  const offer = await prisma.trainerOffer.findUnique({
    where: { token },
    include: {
      trainer: {
        include: { profile: true },
      },
    },
  })

  const serverSession = await getServerSession(authOptions)
  console.warn('[Offer Page] Server session:', {
    email: serverSession?.user?.email,
  })

  if (!offer || !serverSession) {
    notFound()
  }

  return (
    <OfferPage
      offer={offer}
      clientEmail={awaitedSearchParams.client || offer.clientEmail}
    />
  )
}
