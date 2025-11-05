'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useCreateDraftTemplateMutation } from '@/generated/graphql-client'

export function CreatePlanButton() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate: createDraftTemplate, isPending } =
    useCreateDraftTemplateMutation({
      onSuccess: (data) => {
        const newPlan = data.createDraftTemplate

        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })

        router.push(`/trainer/trainings/creator/${newPlan.id}`)
      },
      onError: (error) => {
        console.error('❌ Failed to create draft template:', error)
      },
    })

  return (
    <Button
      onClick={() => createDraftTemplate({})}
      iconStart={<PlusCircle />}
      className="self-baseline"
      loading={isPending}
      disabled={isPending}
    >
      Create New Plan
    </Button>
  )
}
