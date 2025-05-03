import { GQLUser, GQLUserRole } from '@/generated/graphql';
import { User as PrismaUser } from '@prisma/client';

export default class User implements GQLUser {
	constructor(protected data: PrismaUser) {}

	get id() {
		return this.data.id;
	}

	get email() {
		return this.data.email;
	}

	get name() {
		return this.data.name;
	}

	get image() {
		return this.data.image;
	}

	get role() {
		return this.data.role as GQLUserRole; // Cast if needed to match GQLUser's enum
	}

	get createdAt() {
		return this.data.createdAt.toISOString();
	}

	get updatedAt() {
		return this.data.updatedAt.toISOString();
	}

	// Placeholder for relations, implement as needed
	get clients() {
		return []; // TODO: Fetch related clients if needed
	}

	get trainer() {
		return null; // TODO: Fetch related trainer if needed
	}

	get profile() {
		return null; // TODO: Fetch related profile if needed
	}

	get sessions() {
		return []; // TODO: Fetch related sessions if needed
	}
}
