'use client'

import { useUser } from '@/context/user-context'

import { FemaleBodyBackView } from './female-body-back/female-body-back'
import { MaleBodyBackView } from './male-body-back/male-body-back'

interface BodyBackSilhouetteProps {
  className?: string
}

const noopGetPathProps = () => ({
  className:
    'fill-muted-foreground/15 dark:fill-muted-foreground/10 pointer-events-none',
  onClick: () => {},
})

export function BodyBackSilhouette({ className }: BodyBackSilhouetteProps) {
  const { user } = useUser()
  if (user?.profile?.sex === 'Female') {
    return (
      <div className={className}>
        <FemaleBodyBackView getPathProps={noopGetPathProps} />
      </div>
    )
  }

  return (
    <div className={className}>
      <MaleBodyBackView getPathProps={noopGetPathProps} />
    </div>
  )
}
