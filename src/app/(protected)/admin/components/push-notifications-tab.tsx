'use client'

import {
  AlertCircle,
  Bell,
  Loader2,
  Play,
  Send,
  Smartphone,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

interface PushStats {
  total: number
  enabled: number
  disabled: number
  byPlatform: Record<string, number>
}

interface TestResult {
  success: boolean
  message: string
  result?: {
    sent: number
    failed: number
    total: number
    errors: string[]
  }
}

export function PushNotificationsTab() {
  const [stats, setStats] = useState<PushStats | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // Custom notification form
  const [customUserId, setCustomUserId] = useState('')
  const [customTitle, setCustomTitle] = useState('🏋️ Test from Admin')
  const [customMessage, setCustomMessage] = useState(
    'This is a custom test notification from the admin panel!',
  )

  // Load initial stats
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/test-push')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setCurrentUserId(data.currentUserId)
      }
    } catch (error) {
      console.error('Failed to load push notification stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendTestNotification = async (type: string, extraData?: any) => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/admin/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ...extraData,
        }),
      })

      const result = await response.json()
      setTestResult(result)

      // Refresh stats after sending
      if (result.success) {
        await loadStats()
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestCurrentUser = () => {
    sendTestNotification('test-current-user')
  }

  const handleTestCustom = () => {
    if (!customUserId.trim() || !customTitle.trim() || !customMessage.trim()) {
      setTestResult({
        success: false,
        message: 'Please fill in all fields for custom notification',
      })
      return
    }

    sendTestNotification('test-custom', {
      userId: customUserId.trim(),
      title: customTitle.trim(),
      message: customMessage.trim(),
      data: { type: 'admin-custom-test', timestamp: Date.now() },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground">
            Test and manage mobile push notifications
          </p>
        </div>
        <Button
          onClick={loadStats}
          variant="outline"
          disabled={isRefreshing}
          size="sm"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          Refresh Stats
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered mobile devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <Bell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.enabled || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Notifications enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.disabled || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Notifications disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats?.byPlatform ? (
                Object.entries(stats.byPlatform).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between text-sm">
                    <span className="capitalize">{platform}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResult && (
        <Alert className={testResult.success ? 'border-green-200' : ''}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">
                {testResult.success ? '✅ Success' : '❌ Error'}:{' '}
                {testResult.message}
              </div>
              {testResult.result && (
                <div className="text-sm">
                  Sent: {testResult.result.sent}, Failed:{' '}
                  {testResult.result.failed}, Total: {testResult.result.total}
                  {testResult.result.errors.length > 0 && (
                    <div className="mt-1 text-red-600">
                      Errors: {testResult.result.errors.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
          <CardDescription>
            Test push notifications with pre-configured messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Test Current User */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h5 className="font-medium text-blue-600">Test Yourself</h5>
                <p className="text-sm text-muted-foreground">
                  Send a test notification to your account
                </p>
                {currentUserId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    User ID: {currentUserId.slice(0, 8)}...
                  </p>
                )}
              </div>
              <Button
                onClick={handleTestCurrentUser}
                variant="outline"
                disabled={isLoading || !currentUserId}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Test Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Custom Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Notification</CardTitle>
          <CardDescription>
            Send a custom notification to any user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                placeholder="Enter user ID..."
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Notification title..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Notification message..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleTestCustom}
            disabled={
              isLoading ||
              !customUserId.trim() ||
              !customTitle.trim() ||
              !customMessage.trim()
            }
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Custom Notification
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-medium">Testing Instructions:</div>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Make sure your mobile app is installed and logged in</li>
              <li>
                Push notifications must be enabled in your device settings
              </li>
              <li>Test notifications appear immediately on your device</li>
              <li>
                If no notification appears, check the stats above for registered
                tokens
              </li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
