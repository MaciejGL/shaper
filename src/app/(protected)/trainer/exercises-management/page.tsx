import { redirect } from 'next/navigation'

import { ExerciseEditor } from '@/components/exercises/exercise-editor'
import { isModeratorUser } from '@/lib/admin-auth'

export default async function ExerciseManagementPage() {
  // Check if user has moderator access
  const hasModeratorAccess = await isModeratorUser()

  if (!hasModeratorAccess) {
    // Redirect non-moderator users to their dashboard
    redirect('/trainer/dashboard')
  }

  return (
    <div className="container @container/section">
      <ExerciseEditor
        apiEndpoint="/api/moderator/exercises/list"
        updateEndpoint="/api/moderator/exercises/update"
        deleteEndpoint="/api/moderator/exercises/update"
        title="Exercise Management"
      />
    </div>
  )
}
