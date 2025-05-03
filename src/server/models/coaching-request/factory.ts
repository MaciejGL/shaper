import { GQLCoachingRequestStatus } from '@/generated/graphql-server';
import { prisma } from '@/lib/db';
import { UserWithSession } from '@/types/UserWithSession';
import CoachingRequest from './model';

export async function getCoachingRequest({
	id,
	user,
}: {
	id: string;
	user: UserWithSession;
}) {
	const coachingRequest = await prisma.coachingRequest.findUnique({
		where: {
			id,
			OR: [{ senderId: user?.user?.id }, { recipientId: user?.user?.id }],
		},
	});

	return coachingRequest ? new CoachingRequest(coachingRequest) : null;
}

export async function getCoachingRequests({ user }: { user: UserWithSession }) {
	const coachingRequests = await prisma.coachingRequest.findMany({
		where: {
			OR: [{ senderId: user?.user?.id }, { recipientId: user?.user?.id }],
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return coachingRequests.map(coachingRequest => {
		return new CoachingRequest(coachingRequest);
	});
}

export async function upsertCoachingRequest({
	senderId,
	recipientId,
	message,
}: {
	senderId: string;
	recipientId: string;
	message: string;
}) {
	const existingCoachingRequest = await prisma.coachingRequest.findFirst({
		where: {
			recipientId,
			senderId,
		},
	});

	if (existingCoachingRequest) {
		const updatedCoachingRequest = await prisma.coachingRequest.update({
			where: {
				id: existingCoachingRequest.id,
				OR: [
					{ status: GQLCoachingRequestStatus.Pending },
					{ status: GQLCoachingRequestStatus.Cancelled },
				],
			},
			data: {
				message,
				status: GQLCoachingRequestStatus.Pending,
			},
		});

		return new CoachingRequest(updatedCoachingRequest);
	} else {
		const coachingRequest = await prisma.coachingRequest.create({
			data: {
				recipientId,
				senderId,
				message,
				status: GQLCoachingRequestStatus.Pending,
			},
		});

		return new CoachingRequest(coachingRequest);
	}
}

export async function acceptCoachingRequest({
	id,
	recipientId,
}: {
	id: string;
	recipientId: string;
}) {
	const coachingRequest = await prisma.coachingRequest.update({
		where: {
			id,
			status: GQLCoachingRequestStatus.Pending,
			recipientId,
		},
		data: {
			status: GQLCoachingRequestStatus.Accepted,
		},
	});

	return coachingRequest ? new CoachingRequest(coachingRequest) : null;
}

export async function cancelCoachingRequest({
	id,
	senderId,
}: {
	id: string;
	senderId: string;
}) {
	const coachingRequest = await prisma.coachingRequest.update({
		where: { id, senderId, status: GQLCoachingRequestStatus.Pending },
		data: { status: GQLCoachingRequestStatus.Cancelled },
	});

	return coachingRequest ? new CoachingRequest(coachingRequest) : null;
}

export async function rejectCoachingRequest({
	id,
	recipientId,
}: {
	id: string;
	recipientId: string;
}) {
	const coachingRequest = await prisma.coachingRequest.update({
		where: { id, recipientId, status: GQLCoachingRequestStatus.Pending },
		data: { status: GQLCoachingRequestStatus.Rejected },
	});

	return coachingRequest ? new CoachingRequest(coachingRequest) : null;
}
