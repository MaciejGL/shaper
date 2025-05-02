import { Session } from 'next-auth';

export type UserWithSession = {
	user: User;
	session: Session;
};

export type User = {
	id: string;
	email: string;
	phone?: string;
	name?: string;
	role: UserRole;
	image?: string;
	birthday?: Date;
	sex?: string;
	avatarUrl?: string;
	activityLevel?: string;
	goal?: string;
	bio?: string;

	createdAt: Date;
	updatedAt: Date;

	measures?: UserBodyMeasure[];
};

export type UserBodyMeasure = {
	id: string;
	weight?: number;
	height?: number;
	chest?: number;
	waist?: number;
	hips?: number;
	neck?: number;
	biceps?: number;
	thigh?: number;
	calf?: number;
	bodyFat?: number;
	notes?: string;

	createdAt: Date;
	updatedAt: Date;
};

export enum UserRole {
	CLIENT = 'CLIENT',
	TRAINER = 'TRAINER',
	ADMIN = 'ADMIN',
}
