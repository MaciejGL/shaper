'use client'

import { CreditCard, Package, Settings } from 'lucide-react'
import { parseAsStringEnum } from 'nuqs'
import { useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { StripeIdsTab } from './stripe-ids-tab'
import { SubscriptionsTab } from './subscriptions-tab'
import { UnifiedProductManagement } from './unified-product-management'

type StripeSubTab = 'subscriptions' | 'products' | 'ids'

export function StripeTab() {
  const [activeSubTab, setActiveSubTab] = useQueryState(
    'stripe-tab',
    parseAsStringEnum<StripeSubTab>(['subscriptions', 'products', 'ids'])
      .withDefault('subscriptions')
      .withOptions({ clearOnDefault: true }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Stripe Management</h2>
        <p className="text-muted-foreground">
          Manage subscriptions, products, and Stripe Connect accounts
        </p>
      </div>

      <Tabs
        value={activeSubTab}
        onValueChange={(value) => setActiveSubTab(value as StripeSubTab)}
      >
        <TabsList>
          <TabsTrigger value="subscriptions">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="ids">
            <Settings className="h-4 w-4 mr-2" />
            Account IDs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionsTab />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <UnifiedProductManagement />
        </TabsContent>

        <TabsContent value="ids" className="mt-6">
          <StripeIdsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
