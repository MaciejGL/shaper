'use client'

import { ChevronLeft, ChevronRight, Loader2, RefreshCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ResendEmailListItem = {
  id: string
  to: string[]
  from: string
  created_at: string
  subject: string
  last_event: string
}

type ListEmailsResponse = {
  has_more: boolean
  data: ResendEmailListItem[]
}

const STATUS_OPTIONS = [
  'all',
  'sent',
  'delivered',
  'opened',
  'bounced',
  'failed',
  'complained',
] as const

export function EmailLogsTab() {
  const [emails, setEmails] = useState<ResendEmailListItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('all')
  const [limit, setLimit] = useState<'20' | '50' | '100'>('20')

  // Resend pagination: walk forward by passing `after=<lastId>`.
  const [after, setAfter] = useState<string | null>(null)
  const [afterStack, setAfterStack] = useState<(string | null)[]>([])

  const [resending, setResending] = useState<Set<string>>(new Set())

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      limit,
      status,
    })
    if (q.trim()) params.set('q', q.trim())
    if (after) params.set('after', after)
    return params.toString()
  }, [after, limit, q, status])

  const fetchEmails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/resend/emails?${queryString}`)
      const data = (await response.json().catch(() => null)) as
        | ListEmailsResponse
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(
          data && typeof data === 'object' && 'error' in data && data.error
            ? data.error
            : 'Failed to fetch emails',
        )
      }

      if (!data || !('data' in data) || !Array.isArray(data.data)) {
        throw new Error('Unexpected response shape')
      }

      setEmails(data.data)
      setHasMore(Boolean(data.has_more))
    } catch (error) {
      console.error('Failed to fetch email logs:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch emails',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce search a bit to avoid spamming the API while typing.
  useEffect(() => {
    const t = setTimeout(() => {
      fetchEmails()
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString])

  const handlePrev = () => {
    setAfterStack((stack) => {
      const next = [...stack]
      const previousAfter = next.pop() ?? null
      setAfter(previousAfter)
      return next
    })
  }

  const handleNext = () => {
    const lastId = emails[emails.length - 1]?.id
    if (!lastId) return
    setAfterStack((stack) => [...stack, after])
    setAfter(lastId)
  }

  const resetPagination = () => {
    setAfter(null)
    setAfterStack([])
  }

  const handleResend = async (emailId: string) => {
    try {
      setResending((prev) => new Set(prev).add(emailId))
      const response = await fetch(
        `/api/admin/resend/emails/${emailId}/resend`,
        {
          method: 'POST',
        },
      )
      const data = (await response.json().catch(() => null)) as {
        success?: boolean
        resentId?: string | null
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to resend email')
      }

      toast.success(data?.resentId ? `Resent (id: ${data.resentId})` : 'Resent')
    } catch (error) {
      console.error('Resend failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to resend')
    } finally {
      setResending((prev) => {
        const next = new Set(prev)
        next.delete(emailId)
        return next
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[360px]">
            <Input
              id="search-input"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                resetPagination()
              }}
              placeholder="Search by recipient, from, subject..."
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as (typeof STATUS_OPTIONS)[number])
              resetPagination()
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={limit}
            onValueChange={(value) => {
              setLimit(value as '20' | '50' | '100')
              resetPagination()
            }}
          >
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="secondary"
          onClick={fetchEmails}
          loading={isLoading}
          disabled={isLoading}
          iconStart={<RefreshCcw />}
        >
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Created</TableHead>
              <TableHead className="w-[240px]">To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => {
              const isResending = resending.has(email.id)
              const canResend =
                email.last_event === 'bounced' || email.last_event === 'failed'

              return (
                <TableRow key={email.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="space-y-0.5">
                      <div className="text-foreground">
                        {new Date(email.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(email.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {email.to.join(', ')}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="space-y-1">
                      <div className="font-medium">{email.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        From: {email.from}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{renderStatusBadge(email.last_event)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResend(email.id)}
                      loading={isResending}
                      disabled={!canResend || isResending}
                    >
                      Resend
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}

            {isLoading && emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <div className="flex-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading emails...
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && emails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No emails found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {emails.length} email{emails.length === 1 ? '' : 's'}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isLoading || afterStack.length === 0}
            iconStart={<ChevronLeft />}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isLoading || !hasMore || emails.length === 0}
            iconEnd={<ChevronRight />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function renderStatusBadge(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === 'bounced' || normalized === 'failed') {
    return <Badge variant="warning">{normalized}</Badge>
  }

  if (normalized === 'delivered' || normalized === 'opened') {
    return <Badge variant="primary">{normalized}</Badge>
  }

  if (normalized === 'sent') {
    return <Badge variant="secondary">{normalized}</Badge>
  }

  return <Badge variant="outline">{normalized || 'unknown'}</Badge>
}
