import { UserWithSession } from '@/types/UserWithSession';
import { ButtonLink } from '../ui/button-link';
import { LogoutButton } from './logout-button';

export const Navbar = ({ user }: { user?: UserWithSession | null }) => {
	return (
		<div className="border-b border-zinc-200 py-3 px-4 flex justify-between items-center">
			<h1 className="text-xl">Shaper</h1>
			{user ? (
				<div className="flex items-center gap-2">
					<span className="text-sm">{user.user.email}</span>
					<LogoutButton />
				</div>
			) : (
				<ButtonLink href="/login">Login</ButtonLink>
			)}
		</div>
	);
};
