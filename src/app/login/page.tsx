import React from 'react';

import { redirect } from 'next/navigation';
import { LoginCard } from './components/login-card';
import { getCurrentUser } from '@/lib/getUser';
export default async function RequestOtpPage() {
	const user = await getCurrentUser();

	if (user?.user) {
		redirect('/dashboard');
	}
	return (
		<div className="flex items-center justify-center h-full">
			<LoginCard />
		</div>
	);
}
