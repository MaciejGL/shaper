'use client';
import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { Bio } from './components/bio';
import { GoalsAndHealth } from './components/goals-and-health';
import { PhysicalStats } from './components/physical-stats';
import { PersonalInfo } from './components/personal-info';
import {
	GQLProfileQuery,
	useProfileQuery,
	useUpdateProfileMutation,
} from '@/generated/graphql-client';
import { toast } from 'sonner';
import { CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PenIcon } from 'lucide-react';

export type Profile = Pick<
	NonNullable<GQLProfileQuery['profile']>,
	| 'firstName'
	| 'lastName'
	| 'phone'
	| 'email'
	| 'birthday'
	| 'sex'
	| 'avatarUrl'
	| 'height'
	| 'weight'
	| 'fitnessLevel'
	| 'activityLevel'
	| 'goal'
	| 'allergies'
	| 'bio'
>;

export default function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const { data, refetch } = useProfileQuery();
	const { mutateAsync: updateProfile, isPending: isSaving } =
		useUpdateProfileMutation({
			onSuccess: () => {
				setIsEditing(false);
				toast.success('Profile updated successfully');
				refetch();
			},
		});

	const [profile, setProfile] = useState<Profile>({});

	useEffect(() => {
		const profileData = data?.profile;
		if (profileData) {
			setProfile({
				firstName: profileData.firstName,
				lastName: profileData.lastName,
				phone: profileData.phone,
				email: profileData.email,
				birthday: profileData.birthday,
				sex: profileData.sex,
				avatarUrl: profileData.avatarUrl,
				height: profileData.height,
				weight: profileData.weight,
				fitnessLevel: profileData.fitnessLevel,
				activityLevel: profileData.activityLevel,
				goal: profileData.goal,
				allergies: profileData.allergies,
				bio: profileData.bio,
			});
		}
	}, [data]);

	const handleChange = (
		field: keyof NonNullable<GQLProfileQuery['profile']>,
		value: string
	) => {
		setProfile(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const toggleEdit = () => {
		setIsEditing(!isEditing);
	};

	const handleSave = async () => {
		// Here you would save the data to your backend
		console.log('profile', profile);
		const input = {
			...profile,
			height: profile.height ? parseFloat(profile.height.toString()) : null,
			weight: profile.weight ? parseFloat(profile.weight.toString()) : null,
			birthday: profile.birthday ? new Date(profile.birthday).toISOString() : null,
		};
		console.log('input', input);
		await updateProfile({
			input,
		});

		setIsEditing(false);

		// Show success message
	};

	return (
		<div className="container max-w-3xl mx-auto mb-16">
			<Header profile={profile} isEditing={isEditing} />
			<PersonalInfo
				isEditing={isEditing}
				profile={profile}
				handleChange={handleChange}
			/>

			<PhysicalStats
				isEditing={isEditing}
				profile={profile}
				handleChange={handleChange}
			/>

			<GoalsAndHealth
				isEditing={isEditing}
				profile={profile}
				handleChange={handleChange}
			/>

			{/* Bio */}
			<Bio isEditing={isEditing} profile={profile} handleChange={handleChange} />

			{!isEditing ? (
				<Button onClick={toggleEdit} className="fixed bottom-4 right-4">
					<PenIcon /> Edit
				</Button>
			) : (
				<div className="fixed bottom-4 right-4 flex gap-2">
					<Button
						onClick={toggleEdit}
						variant="outline"
						size="icon"
						disabled={isSaving}
					>
						<XIcon />
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						<CheckIcon /> Save changes
					</Button>
				</div>
			)}
		</div>
	);
}
