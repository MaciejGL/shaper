import { notFound } from 'next/navigation'

import { prisma } from '@/lib/db'

import { SuccessPage } from './success-page'

interface SuccessPageProps {
  params: { token: string }
  searchParams: { session_id?: string }
}

export default async function OfferSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { token } = await params
  const awaitedSearchParams = await searchParams
  const sessionId = awaitedSearchParams.session_id

  // Find the offer
  const offer = await prisma.trainerOffer.findUnique({
    where: { token },
    include: {
      trainer: { include: { profile: true } },
    },
  })

  if (!offer) {
    notFound()
  }

  // Mark offer as completed if it was successful
  if (sessionId && offer.status !== 'COMPLETED') {
    await prisma.trainerOffer.update({
      where: { id: offer.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })
  }

  const trainerName = offer.trainer.profile?.firstName
    ? `${offer.trainer.profile.firstName} ${offer.trainer.profile.lastName || ''}`.trim()
    : offer.trainer.name || 'Your Trainer'

  return (
    <SuccessPage
      offer={offer}
      trainerName={trainerName}
      sessionId={sessionId}
    />
  )
}

export async function generateMetadata() {
  return {
    title: 'Payment Successful - Hypertro',
    description: 'Your training package has been purchased successfully.',
    robots: 'noindex, nofollow',
  }
}
