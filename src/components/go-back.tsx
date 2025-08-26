'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useNavigation } from '@/context/navigation-context'

import { Button } from './ui/button'

export function GoBack() {
  const router = useRouter()
  const { previousPath } = useNavigation()

  const handleGoBack = () => {
    router.back()
  }

  if (!previousPath) {
    return null
  }

  const labelMap: { path: string; label: string }[] = [
    {
      path: '/fitspace/workout',
      label: 'Workout',
    },
    {
      path: '/fitspace/my-plans',
      label: 'Plans',
    },
    {
      path: '/fitspace/progress',
      label: 'Progress',
    },
    {
      path: '/fitspace/profile',
      label: 'Profile',
    },
  ]

  const label =
    labelMap.find((item) => previousPath.startsWith(item.path))?.label ??
    'Go Back'

  return (
    <Button variant="ghost" onClick={handleGoBack} className="mt-4">
      <ArrowLeft className="size-4 mr-2" />
      {label}
    </Button>
  )
}
