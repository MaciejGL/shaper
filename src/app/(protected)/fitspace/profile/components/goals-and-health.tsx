import { ReadOnlyField } from '@/components/read-only-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GQLGoal } from '@/generated/graphql-client';
import { Profile } from '../page';

type GoalsAndHealthProps = {
	isEditing: boolean;
	profile: Pick<Profile, 'goal' | 'allergies'>;

	handleChange: (field: keyof Profile, value: string) => void;
};

export function GoalsAndHealth({
	isEditing,
	profile,
	handleChange,
}: GoalsAndHealthProps) {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Fitness Goals & Health Information</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="space-y-2">
					<Label htmlFor="fitnessGoals">Fitness Goals</Label>
					{isEditing ? (
						<Select
							value={profile?.goal ?? ''}
							onValueChange={value => handleChange('goal', value)}
						>
							<SelectTrigger id="goal">
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={GQLGoal.BuildMuscle}>Build Muscle</SelectItem>
								<SelectItem value={GQLGoal.LoseFat}>Lose Fat</SelectItem>
								<SelectItem value={GQLGoal.Maintain}>Maintain</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<ReadOnlyField value={profile?.goal ?? ''} />
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="allergies">Allergies</Label>
					{isEditing ? (
						<Textarea
							id="allergies"
							value={profile?.allergies ?? ''}
							onChange={e => handleChange('allergies', e.target.value)}
						/>
					) : (
						<ReadOnlyField value={profile?.allergies ?? ''} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
