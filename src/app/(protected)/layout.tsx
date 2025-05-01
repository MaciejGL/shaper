import { Main } from '@/components/main';
import { getCurrentUser } from '@/lib/getUser';
export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();

	return <Main user={user}>{children}</Main>;
}
