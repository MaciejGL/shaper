import { Main } from '@/components/main';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser, requireAuth } from '@/lib/getUser';

import { GQLUserRole } from '@/generated/graphql-server';

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	await requireAuth(GQLUserRole.Client);

	return (
		<SidebarProvider>
			<Main user={user}>{children}</Main>
		</SidebarProvider>
	);
}
