import { Main } from '@/components/main';

export default function Layout({ children }: { children: React.ReactNode }) {
	return <Main className="bg-zinc-100">{children}</Main>;
}
