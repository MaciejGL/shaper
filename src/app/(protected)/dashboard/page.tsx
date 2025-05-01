import { requireAuth } from '@/lib/getUser';

export default async function DashboardPage() {
	const session = await requireAuth();

	return (
		<div>
			Dashboard
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</div>
	);
}
