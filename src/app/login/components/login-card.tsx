'use client';

import {
	CardContent,
	CardDescription,
	CardFooter,
	CardTitle,
} from '@/components/ui/card';

import { Card } from '@/components/ui/card';
import { useLoginForm } from './use-login-form.hook';
import { EmailForm } from './email-form';
import { OtpForm } from './otp-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const LoginCard = () => {
	const {
		email,
		otp,
		isLoading,
		showOtp,
		errorMessage,
		leftTime,
		handleEmailChange,
		handleOtpChange,
		handleSendOtp,
		handleLogin,
		handleBack,
		handleResendOtp,
	} = useLoginForm();

	return (
		<Card className="flex flex-col gap-4 bg-background rounded-lg p-4 w-full max-w-md">
			<CardTitle>Login</CardTitle>
			<CardDescription>
				{!showOtp
					? 'Enter your email to receive a one-time password to login.'
					: 'Enter the 6-digit code sent to your email to login.'}
			</CardDescription>
			<CardContent>
				{!showOtp ? (
					<EmailForm
						email={email}
						isLoading={isLoading}
						onEmailChange={handleEmailChange}
						onSubmit={handleSendOtp}
					/>
				) : (
					<OtpForm
						otp={otp}
						onOtpChange={handleOtpChange}
						handleLogin={handleLogin}
					/>
				)}
				{errorMessage && (
					<p className="text-red-500 text-sm text-center">{errorMessage}</p>
				)}
			</CardContent>
			{showOtp && (
				<CardFooter>
					<div className="flex flex-col gap-2 w-full">
						<Button
							variant="default"
							loading={isLoading}
							onClick={handleLogin}
							disabled={otp.length !== 6}
						>
							Login
						</Button>
						{!leftTime ? (
							<Button variant="link" loading={isLoading} onClick={handleResendOtp}>
								Resend code to your email
							</Button>
						) : (
							<p className="text-sm text-center text-muted-foreground">
								You can resend code in {leftTime} seconds
							</p>
						)}
						<Button variant="ghost" size="sm" onClick={handleBack}>
							<ChevronLeft className="size-4" />
							Back to email
						</Button>
					</div>
				</CardFooter>
			)}
		</Card>
	);
};
