'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	useCreateCoachingRequestMutation,
	useGetClientsQuery,
} from '@/generated/graphql-client';
import { GQLUser } from '@/generated/graphql-client';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export function ActiveClientList() {
	const { data } = useGetClientsQuery();

	return (
		<div>
			<div className="flex justify-between items-baseline border-b pb-2">
				<h1 className="text-2xl font-medium">Clients</h1>
				<AddNewClientButton />
			</div>
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 mt-2">
				{data?.user?.clients.map(client => (
					<ClientCard key={client.id} client={client} />
				))}
			</div>
		</div>
	);
}

function ClientCard({
	client,
}: {
	client: Pick<GQLUser, 'id' | 'name' | 'email' | 'image'>;
}) {
	return (
		<Card className="border">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Avatar>
						<AvatarImage src={client.image ?? ''} />
						<AvatarFallback className="text-sm">
							{client.name
								?.split(' ')
								.map(name => name.charAt(0))
								.join('')}
						</AvatarFallback>
					</Avatar>
					{client.name ?? client.email}
				</CardTitle>
				<CardDescription className="flex flex-wrap gap-2">
					{/* <Badge variant="secondary">{client.profile.goal}</Badge>
					<Badge variant="secondary">{client.activeProgram.name}</Badge> */}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

function AddNewClientButton() {
	const [isOpen, setIsOpen] = React.useState(false);
	const [message, setMessage] = React.useState('');
	const [email, setEmail] = React.useState('');
	const { mutate: createCoachingRequest, isPending } =
		useCreateCoachingRequestMutation({
			onSuccess: () => {
				toast.success('Request has been sent to the client.');
				setIsOpen(false);
				setEmail('');
				setMessage('');
			},
		});

	const handleSendRequest = () =>
		createCoachingRequest({ recipientEmail: email, message: message });

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send request to new client</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-2">
					<label htmlFor="email" className="text-sm">
						Email
					</label>
					<Input
						id="email"
						placeholder="Email"
						autoFocus
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>
					<label htmlFor="message" className="text-sm">
						Message
					</label>
					<Textarea
						id="message"
						placeholder="Message"
						value={message}
						onChange={e => setMessage(e.target.value)}
					/>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setIsOpen(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button onClick={handleSendRequest} loading={isPending}>
						Send
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
