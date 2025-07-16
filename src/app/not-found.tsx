import { Home } from 'lucide-react'
import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md" variant="gradient">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
          <div className="relative">
            <Image
              src="/empty-rack.png"
              alt="Error"
              width={160}
              height={160}
              className="h-48 w-48 text-muted-foreground"
            />
            <div className="absolute bottom-2 right-2 bg-muted rotate-12 rounded-xl flex items-center justify-center text-sm whitespace-nowrap p-2">
              Where are all dumbbells again!?!?!!?
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              Looks like we couldn't find the page you're looking for.
              <br />
              Try going back to the dashboard.
            </p>
          </div>

          <div className="flex-center w-full">
            <ButtonLink href="/fitspace/dashboard" iconStart={<Home />}>
              Go To Dashboard
            </ButtonLink>
          </div>

          <div className="text-xs text-muted-foreground">
            Need help? Contact your trainer or check our help section.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
