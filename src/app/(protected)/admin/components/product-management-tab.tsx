'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DatabaseProductsView } from './product-management/database-products-view'
import { StripeProductsView } from './product-management/stripe-products-view'

export function ProductManagementTab() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-gray-600">
            Manage Stripe products and database package templates
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh All
        </Button>
      </div>

      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe">Stripe Products</TabsTrigger>
          <TabsTrigger value="database">Database Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Products</CardTitle>
              <p className="text-sm text-gray-600">
                Live products from your Stripe account. Sync to database to make
                them available for subscriptions.
              </p>
            </CardHeader>
            <CardContent>
              <StripeProductsView refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Package Templates</CardTitle>
              <p className="text-sm text-gray-600">
                Package templates stored in your database. These are available
                for users to subscribe to.
              </p>
            </CardHeader>
            <CardContent>
              <DatabaseProductsView refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
