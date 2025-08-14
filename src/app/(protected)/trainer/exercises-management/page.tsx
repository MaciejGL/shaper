import { redirect } from 'next/navigation'

import { isModeratorUser } from '@/lib/admin-auth'

import { ExerciseManagementContent } from './components/exercise-management-content'

export default async function ExerciseManagementPage() {
  // Check if user has moderator access
  const hasModeratorAccess = await isModeratorUser()

  if (!hasModeratorAccess) {
    // Redirect non-moderator users to their dashboard
    redirect('/trainer/dashboard')
  }

  return (
    <div className="@container/section">
      <ExerciseManagementContent />
    </div>
  )
}
