import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Profile } from '../page';
import { CameraIcon } from 'lucide-react';

type HeaderProps = {
	profile: Pick<Profile, 'firstName' | 'lastName' | 'avatarUrl' | 'sex'>;
	isEditing: boolean;
};

export function Header({ profile, isEditing }: HeaderProps) {
	return (
		<div className="flex flex-col items-center mb-6 md:flex-row md:items-start md:gap-6">
			<div className="relative mb-4 md:mb-0">
				<Avatar className="w-24 h-24 border-4 border-white shadow-md">
					<AvatarImage
						src={profile?.avatarUrl || getAvatarUrl(profile?.sex) || ''}
						alt={`${profile?.firstName} ${profile?.lastName}`}
					/>
				</Avatar>
				{isEditing && (
					<Button
						size="icon"
						className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary shadow-md"
					>
						<CameraIcon className="w-4 h-4" />
					</Button>
				)}
			</div>

			{profile?.firstName && profile?.lastName && (
				<div className="text-center md:text-left flex-1">
					<h2 className="text-2xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
				</div>
			)}
		</div>
	);
}

const getAvatarUrl = (sex?: string | null) => {
	if (!sex) return null;
	if (sex.toLowerCase() === 'male') return '/avatar-male.png';
	if (sex.toLowerCase() === 'female') return '/avatar-female.png';
	return null;
};
