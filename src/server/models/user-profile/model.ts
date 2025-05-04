import { UserProfile as PrismaUserProfile } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
	GQLActivityLevel,
	GQLFitnessLevel,
	GQLGoal,
	GQLUserProfile,
} from '@/generated/graphql-server';

export default class UserProfile implements GQLUserProfile {
	constructor(protected data: PrismaUserProfile) {}

	get id() {
		return this.data.id;
	}

	get firstName() {
		return this.data.firstName;
	}

	get lastName() {
		return this.data.lastName;
	}

	async email() {
		const user = await prisma.user.findUnique({
			where: {
				id: this.data.userId,
			},
			select: {
				email: true,
			},
		});

		return user?.email;
	}

	get phone() {
		return this.data.phone;
	}

	get birthday() {
		return this.data.birthday?.toISOString();
	}

	get sex() {
		return this.data.sex;
	}

	get avatarUrl() {
		return this.data.avatarUrl;
	}

	get height() {
		return this.data.height;
	}

	async weight() {
		const latestMeasure = await prisma.userBodyMeasure.findFirst({
			where: {
				userProfileId: this.data.id,
				weight: {
					not: null,
				},
			},
			orderBy: {
				measuredAt: 'desc',
			},
		});

		return latestMeasure?.weight || this.data.weight;
	}

	get fitnessLevel() {
		switch (this.data.fitnessLevel) {
			case 'BEGINNER':
				return GQLFitnessLevel.Beginner;
			case 'INTERMEDIATE':
				return GQLFitnessLevel.Intermediate;
			case 'ADVANCED':
				return GQLFitnessLevel.Advanced;
			case 'EXPERT':
				return GQLFitnessLevel.Expert;
			default:
				return null;
		}
	}

	get allergies() {
		return this.data.allergies;
	}

	get activityLevel() {
		switch (this.data.activityLevel) {
			case 'SEDENTARY':
				return GQLActivityLevel.Sedentary;
			case 'LIGHT':
				return GQLActivityLevel.Light;
			case 'MODERATE':
				return GQLActivityLevel.Moderate;
			case 'ACTIVE':
				return GQLActivityLevel.Active;
			case 'ATHLETE':
				return GQLActivityLevel.Athlete;
			default:
				return null;
		}
	}

	get goal() {
		switch (this.data.goal) {
			case 'LOSE_FAT':
				return GQLGoal.LoseFat;
			case 'MAINTAIN':
				return GQLGoal.Maintain;
			case 'BUILD_MUSCLE':
				return GQLGoal.BuildMuscle;
			default:
				return null;
		}
	}

	get bio() {
		return this.data.bio;
	}

	get createdAt() {
		return this.data.createdAt.toISOString();
	}

	get updatedAt() {
		return this.data.updatedAt.toISOString();
	}

	get bodyMeasures() {
		return [];
		// return this.data.bodyMeasures.map((measure) => new UserBodyMeasure(measure));
	}
}
