import { requireAuth } from '@/lib/getUser';
import { Test } from './components/test';

export default async function DashboardPage() {
	await requireAuth();

	return (
		<div>
			TRAINER DASHBOARD
			<Test />
		</div>
	);
}
