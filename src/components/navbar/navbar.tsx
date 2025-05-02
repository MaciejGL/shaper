'use client';

import { UserWithSession } from '@/types/UserWithSession';
import { LogoutButton } from './logout-button';
import {
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { NavigationMenu } from '../ui/navigation-menu';
import { LogInIcon, MenuIcon, UserIcon } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { CLIENT_LINKS, TRAINER_LINKS } from '@/constants/user-links';
import { cn } from '@/lib/utils';

export const Navbar = ({ user }: { user?: UserWithSession | null }) => {
	return (
		<div className="border-b border-zinc-200 py-3 px-4 flex justify-between items-center">
			<h1 className="text-xl">Shaper</h1>

			<NavbarUser user={user} />
		</div>
	);
};

function NavbarUser({ user }: { user?: UserWithSession | null }) {
	const pathname = usePathname();
	const isActiveLink = (path: string) => pathname === path;

	if (!user && isActiveLink('/login')) {
		return null;
	}

	if (!user) {
		return (
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<Link href="/login" passHref>
							<NavigationMenuLink>
								<LogInIcon className="w-4 h-4" />
							</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		);
	}

	if (user?.user?.role === 'TRAINER') {
		return <TrainerNavbar />;
	}

	if (user?.user?.role === 'CLIENT') {
		return <ClientNavbar />;
	}

	return null;
}

const Link = ({
	href,
	disabled,
	...props
}: { href: string; disabled?: boolean } & React.ComponentProps<
	typeof NextLink
>) => {
	const pathname = usePathname();
	const isActive = href === pathname;

	return (
		<NavigationMenuLink asChild active={isActive}>
			<NextLink
				href={href}
				className={cn({
					'pointer-events-none opacity-30': disabled,
					'bg-primary text-primary-foreground': isActive,
				})}
				{...props}
			/>
		</NavigationMenuLink>
	);
};

function TrainerNavbar() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger withChevron={false}>
						<UserIcon className="w-4 h-4" />
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<Link
							href={TRAINER_LINKS.profile.href}
							disabled={TRAINER_LINKS.profile.disabled}
						>
							{TRAINER_LINKS.profile.label}
						</Link>
						<LogoutButton />
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger withChevron={false}>
						<MenuIcon className="w-4 h-4" />
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<Link
							href={TRAINER_LINKS.dashboard.href}
							disabled={TRAINER_LINKS.dashboard.disabled}
						>
							{TRAINER_LINKS.dashboard.label}
						</Link>
						<Link
							href={TRAINER_LINKS.clients.href}
							disabled={TRAINER_LINKS.clients.disabled}
						>
							{TRAINER_LINKS.clients.label}
						</Link>
						<Link
							href={TRAINER_LINKS.trainings.href}
							disabled={TRAINER_LINKS.trainings.disabled}
						>
							{TRAINER_LINKS.trainings.label}
						</Link>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

function ClientNavbar() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger withChevron={false}>
						<UserIcon className="w-4 h-4" />
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<Link
							href={CLIENT_LINKS.profile.href}
							disabled={CLIENT_LINKS.profile.disabled}
						>
							{CLIENT_LINKS.profile.label}
						</Link>
						<LogoutButton />
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger withChevron={false}>
						<MenuIcon className="w-4 h-4" />
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<Link
							href={CLIENT_LINKS.dashboard.href}
							disabled={CLIENT_LINKS.dashboard.disabled}
						>
							{CLIENT_LINKS.dashboard.label}
						</Link>
						<Link
							href={CLIENT_LINKS.trainings.href}
							disabled={CLIENT_LINKS.trainings.disabled}
						>
							{CLIENT_LINKS.trainings.label}
						</Link>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
