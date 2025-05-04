'use client';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import type { UserWithSession } from '@/types/UserWithSession';
import { Navbar } from './navbar/navbar';
import { usePathname } from 'next/navigation';

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
	const pathname = usePathname();
	const isFitspace = pathname.includes('fitspace');
	return (
		<main
			className={cn(
				'min-h-screen grid grid-rows-[auto_1fr] w-full bg-secondary',
				className
			)}
		>
			<Navbar user={user} withSidebar={withSidebar} />
			<div className={cn('pr-2 pb-2', isFitspace && 'px-0 pb-0')}>
				<div
					className={cn(
						'w-full h-full p-2 md:p-4 lg:p-8 bg-white rounded-md shadow-xs',
						isFitspace && 'rounded-none shadow-none bg-zinc-100'
					)}
				>
					{children}
				</div>
			</div>
		</main>
	);
};
