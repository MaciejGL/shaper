import { Main } from '@/components/main';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser, requireAuth } from '@/lib/getUser';
import { AppSidebar } from './components/app-sidebar';
import { GQLUserRole } from '@/generated/graphql-server';
export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	await requireAuth(GQLUserRole.Trainer);

	return (
		<SidebarProvider>
			<AppSidebar />
			<Main user={user} withSidebar>
				{children}
			</Main>
		</SidebarProvider>
	);
}
