'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RequestOtpPage() {
	const [email, setEmail] = useState('');

	const sendOtp = async () => {
		await fetch('/api/auth/request-otp', {
			method: 'POST',
			body: JSON.stringify({ email }),
			headers: { 'Content-Type': 'application/json' },
		});
	};

	return (
		<div className="p-4">
			<Input value={email} onChange={e => setEmail(e.target.value)} />
			<Button onClick={sendOtp}>Send OTP</Button>
		</div>
	);
}
