import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import Link, { LinkProps } from 'next/link';

function ButtonLink({
	className,
	variant,
	size,
	children,
	...props
}: LinkProps &
	VariantProps<typeof buttonVariants> & {
		className?: string;
		children: React.ReactNode;
		disabled?: boolean;
	}) {
	return (
		<Link className={cn(buttonVariants({ variant, size, className }))} {...props}>
			{children}
		</Link>
	);
}

export { ButtonLink };
