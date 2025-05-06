import { Users } from 'lucide-react'

export function ClientsHeader() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">My Clients</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your clients, track their progress, and schedule sessions.
      </p>
    </div>
  )
}
