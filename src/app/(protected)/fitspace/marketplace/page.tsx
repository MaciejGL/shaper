import { ButtonLink } from '@/components/ui/button-link'

export default async function MarketplacePage() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-full mt-16 gap-4 text-center">
        <h1 className="text-2xl font-bold">Currently not available</h1>
        <p className="text-sm text-muted-foreground">
          We are working on this feature and it will be available at some point.
        </p>
        <ButtonLink href="/">Go to dashboard</ButtonLink>
      </div>
    </div>
  )
}
