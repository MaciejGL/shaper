import { notFound } from 'next/navigation'

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

  if (!offer) {
    notFound()
  }

  return (
    <OfferPage
      offer={offer}
      clientEmail={awaitedSearchParams.client || offer.clientEmail}
    />
  )
}
