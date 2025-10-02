'use client'

import { ClientSurveyModal } from '@/components/client-survey/client-survey-modal'
import { useClientSurvey } from '@/components/client-survey/use-client-survey.hook'
import { Button } from '@/components/ui/button'

export function SurveyDemo() {
  const { isModalOpen, openSurvey, closeSurvey, handleSubmit } =
    useClientSurvey()

  return (
    <div className="p-4">
      <Button onClick={openSurvey}>Test Survey Modal</Button>
      <ClientSurveyModal
        open={isModalOpen}
        onClose={closeSurvey}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
