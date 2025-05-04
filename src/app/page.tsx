import { Main } from '@/components/main'
import { ButtonLink } from '@/components/ui/button-link'

export default function Home() {
  return (
    <Main>
      <div className="flex flex-col items-center gap-8 justify-center h-screen">
        <ButtonLink href="/login">Login</ButtonLink>
      </div>
    </Main>
  )
}
