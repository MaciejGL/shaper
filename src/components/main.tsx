import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import type { UserWithSession } from '@/types/UserWithSession';
import { Navbar } from './navbar/navbar';

interface MainProps {
	children: ReactNode;
	className?: string;
	user?: UserWithSession | null;
}

export const Main = ({ children, className, user }: MainProps) => {
	return (
		<main className={cn('min-h-screen grid grid-rows-[auto_1fr]', className)}>
			<Navbar user={user} />
			<div className="w-full h-full p-2 md:p-4 lg:p-8">{children}</div>
		</main>
	);
};
