import { ButtonLink } from '@/components/ui/button-link'

export default function Home() {
  return (
    <main className="min-h-screen grid grid-rows-1 w-full bg-zinc-100">
      <div className="flex flex-col items-center gap-8 justify-center h-screen">
        <ButtonLink href="/login">Login</ButtonLink>
      </div>
    </main>
  )
}
