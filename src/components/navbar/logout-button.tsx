'use client';

import { signOut } from 'next-auth/react';
import { NavigationMenuLink } from '../ui/navigation-menu';

export const LogoutButton = () => {
	const handleLogout = async () => {
		await signOut();
	};
	return (
		<NavigationMenuLink onClick={() => handleLogout()} className="cursor-pointer">
			Logout
		</NavigationMenuLink>
	);
};
