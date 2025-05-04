'use client';

import { ReadOnlyField } from '@/components/read-only-field';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	useMyCoachingRequestsQuery,
	useAcceptCoachingRequestMutation,
	useRejectCoachingRequestMutation,
} from '@/generated/graphql-client';
import { toast } from 'sonner';

export function PendingRequests() {
	const { data, isLoading, refetch } = useMyCoachingRequestsQuery();
	const { mutate: acceptRequest } = useAcceptCoachingRequestMutation({
		onSuccess: () => {
			refetch();
			toast.success('Request accepted');
		},
	});
	const { mutate: rejectRequest } = useRejectCoachingRequestMutation({
		onSuccess: () => {
			refetch();
			toast.success('Request rejected');
		},
	});
	if (isLoading) return <div>Loading...</div>;

	if (data?.coachingRequests.length === 0) return <div>No pending requests</div>;

	const pendingRequests = data?.coachingRequests.filter(
		request => request.status === 'PENDING'
	);

	const latestRequest = pendingRequests?.at(0);
	if (!latestRequest) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Training Request</CardTitle>
			</CardHeader>
			<CardContent>
				<p>
					<span className="font-bold">{latestRequest.sender.email}</span> has invited
					You to start a new training journey.
				</p>

				<p className="text-sm text-muted-foreground mt-4 mb-2">Message</p>
				<ReadOnlyField value={latestRequest.message ?? ''} />
			</CardContent>

			<CardFooter className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => rejectRequest({ id: latestRequest.id })}
				>
					Decline
				</Button>
				<Button onClick={() => acceptRequest({ id: latestRequest.id })}>
					Accept
				</Button>
			</CardFooter>
		</Card>
	);
}
