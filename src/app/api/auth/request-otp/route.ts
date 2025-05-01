import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';

export async function POST(req: Request) {
	const { email } = await req.json();
	const otp = randomInt(100000, 999999).toString();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

	let user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		user = await prisma.user.create({ data: { email } });
	}

	await prisma.userSession.create({
		data: { userId: user.id, otp, expiresAt },
	});

	console.log('OTP:', otp); // Replace with real email service later

	return NextResponse.json({ success: true });
}
