import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { GQLUser, GQLUserProfile } from '@/generated/graphql-client';
import { PlusIcon } from 'lucide-react';

export default async function Page() {
	return (
		<div>
			<ActiveClientList />
		</div>
	);
}

type Client = Pick<GQLUser, 'id' | 'name' | 'email'> & {
	profile: Pick<GQLUserProfile, 'avatarUrl' | 'goal'>;
	activeProgram: {
		id: string;
		name: string;
	};
};

function ActiveClientList() {
	const clients: Client[] = [
		{
			id: '1',
			name: 'John Doe',
			email: 'john.doe@example.com',
			activeProgram: {
				id: '1',
				name: 'Powerlifting',
			},
			profile: {
				avatarUrl: 'https://example.com/avatar.png',
				goal: 'Lose weight',
			},
		},
		{
			id: '2',
			name: 'Jane Doe',
			email: 'jane.doe@example.com',
			activeProgram: {
				id: '1',
				name: 'Bootybuilder',
			},
			profile: {
				avatarUrl: 'https://example.com/avatar.png',
				goal: 'Gain weight',
			},
		},
	];

	return (
		<div>
			<h1 className="text-2xl font-bold mb-2">Clients</h1>
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{clients.map(client => (
					<ClientCard key={client.id} client={client} />
				))}
				<AddNewClientCard />
			</div>
		</div>
	);
}

function ClientCard({ client }: { client: Client }) {
	return (
		<Card className="border">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Avatar>
						<AvatarImage src={client.profile.avatarUrl ?? ''} />
						<AvatarFallback className="text-sm">
							{client.name
								?.split(' ')
								.map(name => name.charAt(0))
								.join('')}
						</AvatarFallback>
					</Avatar>
					{client.name}
				</CardTitle>
				<CardDescription className="flex flex-wrap gap-2">
					<Badge variant="secondary">{client.profile.goal}</Badge>
					<Badge variant="secondary">{client.activeProgram.name}</Badge>
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

function AddNewClientCard() {
	return (
		<Card className="group/add-client border flex cursor-pointer items-center justify-center bg-muted transition-colors hover:bg-muted/50">
			<PlusIcon className="text-muted-foreground group-hover/add-client:text-primary" />
		</Card>
	);
}
