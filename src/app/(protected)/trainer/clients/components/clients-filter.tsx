'use client'

import { Search } from 'lucide-react'
import { useQueryState } from 'nuqs'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Input } from '@/components/ui/input'

import { AddClientModal } from './add-new-client'

export function ClientsFilter() {
  const [search, setSearch] = useQueryState('search', {
    defaultValue: '',
    clearOnDefault: true,
  })
  return (
    <AnimatedPageTransition id="clients-filter">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-72">
          <Input
            id="search"
            type="search"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconStart={<Search className="h-4 w-4 text-muted-foreground" />}
            className="pl-8 w-full"
          />
        </div>

        <AddClientModal />
      </div>
    </AnimatedPageTransition>
  )
}
