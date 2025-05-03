import { GQLUserRole } from '@/generated/graphql';
import { requireAuth } from '@/lib/getUser';

export default async function DashboardPage() {
	const session = await requireAuth(GQLUserRole.Client);

	return (
		<div>
			USER DASHBOARD
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</div>
	);
}
