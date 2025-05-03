import React from 'react';

import { redirect } from 'next/navigation';
import { LoginCard } from './components/login-card';
import { getCurrentUser } from '@/lib/getUser';
import { GQLUserRole } from '@/generated/graphql-server';
export default async function RequestOtpPage() {
	const user = await getCurrentUser();

	if (user?.user.role) {
		const role = user.user.role;
		if (role === GQLUserRole.Client) {
			redirect('/fitspace/dashboard');
		} else if (role === GQLUserRole.Trainer) {
			redirect('/trainer/dashboard');
		}
	}
	return (
		<div className="flex items-center justify-center h-full">
			<LoginCard />
		</div>
	);
}
