import { Settings } from 'lucide-react'

import { getCurrentUser } from '@/lib/getUser'

import { SettingsContent } from './components/settings-content'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <div className="container-hypertro mx-auto pt-8 max-w-5xl">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
          Customize your experience and manage your account
        </p>
      </div>
      <SettingsContent />
    </div>
  )
}
