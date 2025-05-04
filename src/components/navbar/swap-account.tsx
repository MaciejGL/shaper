'use client';

import { signIn } from 'next-auth/react';
import { NavigationMenuLink } from '../ui/navigation-menu';
import { UserWithSession } from '@/types/UserWithSession';
import { GQLUserRole } from '@/generated/graphql-server';
import { ArrowRightLeftIcon } from 'lucide-react';
import { Button } from '../ui/button';
export const SwapAccountButton = ({
	user,
}: {
	user?: UserWithSession | null;
}) => {
	const isProduction = process.env.NODE_ENV === 'production';

	if (isProduction) {
		return null;
	}

	// Define the email or logic for the other account type
	const clientEmail = process.env.NEXT_PUBLIC_TEST_CLIENT_EMAIL;
	const trainerEmail = process.env.NEXT_PUBLIC_TEST_TRAINER_EMAIL;
	const swapTo =
		user?.user.role === GQLUserRole.Client ? trainerEmail : clientEmail;
	const handleSwap = async () => {
		await signIn('account-swap', {
			email: swapTo,
		});
	};

	return (
		<NavigationMenuLink onClick={handleSwap} className="cursor-pointer" asChild>
			<Button variant="outline" className="flex flex-row items-center gap-2">
				<ArrowRightLeftIcon />
				<span>{user?.user.role === GQLUserRole.Client ? 'Trainer' : 'Client'}</span>
			</Button>
		</NavigationMenuLink>
	);
};
