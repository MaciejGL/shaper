import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 365; // 1 year
const OTP = process.env.NEXT_PUBLIC_OTP;

export async function POST(req: Request) {
	const { email } = await req.json();
	const otp = OTP || randomInt(100000, 999999).toString();
	const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME);

	let user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		user = await prisma.user.create({
			data: { email, profile: { create: { firstName: '', lastName: '' } } },
		});
	}

	await prisma.userSession.create({
		data: { userId: user.id, otp, expiresAt },
	});

	console.info('OTP:', otp); // Replace with real email service later

	return NextResponse.json({ success: true });
}
