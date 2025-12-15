'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Search,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Subscription {
  id: string
  initialStripeInvoiceId: string | null
  externalOfferToken: string | null
  originPlatform: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  package: {
    name: string
    stripeLookupKey: string | null
  }
}

interface SubscriptionsResponse {
  subscriptions: Subscription[]
  total: number
}

interface VerifyResult {
  verified: boolean
  invoiceId: string
  googleData?: Record<string, unknown>
  message?: string
}

export function ExternalOffersTab() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [refundDialog, setRefundDialog] = useState<{
    open: boolean
    invoiceId: string
  }>({ open: false, invoiceId: '' })

  // Fetch subscriptions
  const { data, isLoading } = useQuery<SubscriptionsResponse>({
    queryKey: ['external-offers-subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/external-offers?limit=100')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // Verify single
  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/external-offers/${id}/verify`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Verification failed')
      return res.json() as Promise<VerifyResult>
    },
    onSuccess: (result) => {
      setVerifyResult(result)
    },
  })

  // Report refund
  const refundMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch('/api/admin/external-offers/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalTransactionId: invoiceId }),
      })
      if (!res.ok) throw new Error('Refund failed')
      return res.json()
    },
    onSuccess: () => {
      setRefundDialog({ open: false, invoiceId: '' })
      queryClient.invalidateQueries({
        queryKey: ['external-offers-subscriptions'],
      })
    },
  })

  const filteredSubscriptions = data?.subscriptions.filter((s) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.initialStripeInvoiceId?.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      s.user.name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          External Offers Reporting
        </h2>
        <p className="text-muted-foreground">
          View Android subscriptions and verify Google Play reporting
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Android Subscriptions</CardDescription>
            <CardTitle className="text-2xl">{data?.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With Token</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {data?.subscriptions.filter((s) => s.externalOfferToken).length ??
                0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With Invoice ID</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {data?.subscriptions.filter((s) => s.initialStripeInvoiceId)
                .length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-external-offers"
            placeholder="Search by invoice ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No Android subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">
                      {sub.initialStripeInvoiceId
                        ? `${sub.initialStripeInvoiceId.slice(0, 20)}...`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{sub.user.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">
                        {sub.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.package.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {sub.externalOfferToken ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => verifyMutation.mutate(sub.id)}
                            disabled={
                              !sub.initialStripeInvoiceId ||
                              verifyMutation.isPending
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify with Google
                          </DropdownMenuItem>
                          {sub.initialStripeInvoiceId && (
                            <DropdownMenuItem
                              onClick={() =>
                                setRefundDialog({
                                  open: true,
                                  invoiceId: sub.initialStripeInvoiceId!,
                                })
                              }
                            >
                              Report Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verify Result Dialog */}
      <Dialog open={!!verifyResult} onOpenChange={() => setVerifyResult(null)}>
        <DialogContent dialogTitle="Verification Result">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyResult?.verified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Verified in Google
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Not Found in Google
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Invoice: {verifyResult?.invoiceId}
            </DialogDescription>
          </DialogHeader>
          {verifyResult?.googleData && (
            <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(verifyResult.googleData, null, 2)}
            </pre>
          )}
          {verifyResult?.message && (
            <p className="text-muted-foreground">{verifyResult.message}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog
        open={refundDialog.open}
        onOpenChange={(open) =>
          setRefundDialog({ open, invoiceId: refundDialog.invoiceId })
        }
      >
        <DialogContent dialogTitle="Report Refund">
          <DialogHeader>
            <DialogTitle>Report Refund to Google</DialogTitle>
            <DialogDescription>
              This will report a full refund for this transaction to Google
              Play.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              id="refund-transaction-id"
              label="Transaction ID"
              value={refundDialog.invoiceId}
              disabled
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialog({ open: false, invoiceId: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => refundMutation.mutate(refundDialog.invoiceId)}
              loading={refundMutation.isPending}
              disabled={refundMutation.isPending}
            >
              Report Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
