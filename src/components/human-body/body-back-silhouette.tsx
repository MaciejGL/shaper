'use client'

import { useUser } from '@/context/user-context'

import { BackBodyView } from './body-back/body-back'
import { FemaleBodyBackView } from './female-body-back/female-body-back'

interface BodyBackSilhouetteProps {
  className?: string
}

const noopGetPathProps = () => ({
  className:
    'fill-muted-foreground/15 dark:fill-muted-foreground/10 pointer-events-none',
  onClick: () => {},
})

const noopHandler = () => false

export function BodyBackSilhouette({ className }: BodyBackSilhouetteProps) {
  const { user } = useUser()
  if (user?.profile?.sex === 'Female') {
    return (
      <div className={className}>
        <FemaleBodyBackView
          getPathProps={noopGetPathProps}
          isRegionSelected={noopHandler}
          handleRegionClick={() => {}}
          hideLabels
        />
      </div>
    )
  }

  return (
    <BackBodyView
      getPathProps={noopGetPathProps}
      isRegionSelected={noopHandler}
      handleRegionClick={() => {}}
      hideLabels
    />
  )
}
