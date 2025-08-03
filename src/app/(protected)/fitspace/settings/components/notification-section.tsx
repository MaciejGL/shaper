'use client'

import { Bell } from 'lucide-react'

export function NotificationSection() {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Notifications Coming Soon
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              We're working on a comprehensive notification system. Check back
              soon for workout reminders, progress updates, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
