import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBillingHistory, useDownloadInvoice } from '@/hooks/use-subscription'

interface BillingHistoryProps {
  userId: string
}

export function BillingHistory({ userId }: BillingHistoryProps) {
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useBillingHistory(
    userId,
    pageSize,
    page * pageSize,
  )
  const downloadMutation = useDownloadInvoice()

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100) // Convert from cents
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return (
          <Badge
            variant="success"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'refunded':
        return (
          <Badge variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error Loading Billing History
          </CardTitle>
          <CardDescription>
            Unable to load your billing history. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your payment history and invoices will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No billing history found</p>
            <p className="text-sm">
              Your payment records will appear here once you subscribe
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your payment history and download invoices
            </CardDescription>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="font-medium">
              Total Paid:{' '}
              {formatAmount(data.summary.totalPaid, data.summary.currency)}
            </div>
            {data.summary.totalRefunded > 0 && (
              <div className="text-gray-500">
                Refunded:{' '}
                {formatAmount(
                  data.summary.totalRefunded,
                  data.summary.currency,
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(record.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(record.periodStart)} -{' '}
                      {formatDate(record.periodEnd)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium">{record.description}</div>
                      <div className="text-sm text-gray-500">
                        {record.package.name} • {record.package.duration}
                      </div>
                      {record.failureReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {record.failureReason}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {formatAmount(record.amount, record.currency)}
                    </div>
                    {record.refundAmount && record.refundAmount > 0 && (
                      <div className="text-sm text-gray-500">
                        Refunded:{' '}
                        {formatAmount(record.refundAmount, record.currency)}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(record.status)}
                    {record.paidAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Paid {formatDate(record.paidAt)}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {record.stripeInvoiceId &&
                        record.status.toLowerCase() === 'succeeded' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                downloadMutation.mutate({
                                  userId,
                                  invoiceId: record.stripeInvoiceId!,
                                })
                              }}
                              disabled={downloadMutation.isPending}
                              title="Download Invoice PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open Stripe hosted invoice page
                                if (record.stripeInvoiceId?.startsWith('in_')) {
                                  window.open(
                                    `https://invoice.stripe.com/i/acct_${process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID || 'test'}/${record.stripeInvoiceId}`,
                                    '_blank',
                                  )
                                }
                              }}
                              title="View Invoice Online"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data.pagination.hasMore && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={isLoading}
            >
              Load More
            </Button>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Records</div>
              <div className="font-medium">{data.summary.totalRecords}</div>
            </div>
            <div>
              <div className="text-gray-500">Total Paid</div>
              <div className="font-medium text-green-600">
                {formatAmount(data.summary.totalPaid, data.summary.currency)}
              </div>
            </div>
            {data.summary.totalRefunded > 0 && (
              <div>
                <div className="text-gray-500">Total Refunded</div>
                <div className="font-medium text-orange-600">
                  {formatAmount(
                    data.summary.totalRefunded,
                    data.summary.currency,
                  )}
                </div>
              </div>
            )}
            <div>
              <div className="text-gray-500">Currency</div>
              <div className="font-medium">{data.summary.currency}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
