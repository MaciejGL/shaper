'use client'

import { CreditCard, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BillingStatus } from '@/generated/prisma/client'

interface BillingRecord {
  id: string
  type: 'SUBSCRIPTION' | 'ONE_TIME_PURCHASE'
  status: BillingStatus
  amount: number
  currency: string
  stripePaymentIntentId?: string
  description?: string
  createdAt: string
  package?: {
    name: string
  }
}

interface BillingHistoryData {
  records: BillingRecord[]
  summary: {
    totalSpent: number
    successfulPayments: number
    failedPayments: number
  }
}

interface BillingHistoryPreviewProps {
  billingHistory?: BillingHistoryData
  isLoading: boolean
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
}

export function BillingHistoryPreview({
  billingHistory,
  isLoading,
  formatCurrency,
  formatDate,
}: BillingHistoryPreviewProps) {
  const getStatusBadge = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.SUCCEEDED:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Successful
          </Badge>
        )
      case BillingStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>
      case BillingStatus.PENDING:
        return <Badge variant="outline">Pending</Badge>
      case BillingStatus.REFUNDED:
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing History
        </CardTitle>
        <CardDescription>
          Recent payment records and transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading billing history...
          </div>
        ) : billingHistory ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(billingHistory.summary.totalSpent)}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {billingHistory.summary.successfulPayments}
                </div>
                <div className="text-sm text-muted-foreground">
                  Successful Payments
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {billingHistory.summary.failedPayments}
                </div>
                <div className="text-sm text-muted-foreground">
                  Failed Payments
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            {billingHistory.records.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3">
                  Recent Transactions ({billingHistory.records.length})
                </h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.records.slice(0, 5).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-sm">
                            {formatDate(record.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {record.type === 'SUBSCRIPTION'
                                ? 'Subscription'
                                : 'One-time'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {record.description ||
                                record.package?.name ||
                                'Payment'}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(record.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No billing records found
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No billing data found for this user
          </div>
        )}
      </CardContent>
    </Card>
  )
}
