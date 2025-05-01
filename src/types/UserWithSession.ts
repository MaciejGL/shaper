import { Session } from 'next-auth';

export type UserWithSession = {
	user: User;
	session: Session;
};

export type User = {
	id: string;
	email: string;
};
