import { Settings } from 'lucide-react'

import { getCurrentUser } from '@/lib/getUser'

import { TrainerSettingsContent } from './components/trainer-settings-content'

export default async function TrainerSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <div className="container-hypertro mx-auto pt-8 max-w-5xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Trainer Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
          Customize your trainer experience and manage your account
        </p>
      </div>
      <TrainerSettingsContent />
    </div>
  )
}
