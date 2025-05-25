import { ClientsFilter } from './components/clients-filter'
import { ClientsHeader } from './components/clients-header'
import { ClientsTabs } from './components/clients-tabs'

export default async function Page() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ClientsHeader />
      <ClientsFilter />
      <ClientsTabs />
    </div>
  )
}
