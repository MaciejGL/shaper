import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import type { UserWithSession } from '@/types/UserWithSession';
import { Navbar } from './navbar/navbar';

interface MainProps {
	children: ReactNode;
	className?: string;
	user?: UserWithSession | null;
	withSidebar?: boolean;
}

export const Main = ({
	children,
	className,
	user,
	withSidebar = false,
}: MainProps) => {
	return (
		<main
			className={cn(
				'min-h-screen grid grid-rows-[auto_1fr] w-full bg-secondary',
				className
			)}
		>
			<Navbar user={user} withSidebar={withSidebar} />
			<div className="pr-2 pb-2">
				<div className="w-full h-full p-2 md:p-4 lg:p-8 bg-white rounded-md shadow-xs">
					{children}
				</div>
			</div>
		</main>
	);
};
