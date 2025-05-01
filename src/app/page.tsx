import { Main } from '@/components/main';
import { ButtonLink } from '@/components/ui/button-link';

export default function Home() {
	return (
		<Main className="flex flex-col items-center gap-8 justify-center h-screen">
			<h1 className="text-4xl font-semibold">Shaper</h1>
			<ButtonLink href="/login">Login</ButtonLink>
		</Main>
	);
}
