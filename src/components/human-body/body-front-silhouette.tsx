'use client'

import { useUser } from '@/context/user-context'

import { FrontBodyView } from './body-front/body-front'
import { FemaleBodyFrontView } from './female-body-front/female-body-front'

interface BodyFrontSilhouetteProps {
  className?: string
}

const noopGetPathProps = () => ({
  className: 'fill-[#424747] dark:fill-muted-foreground/10 pointer-events-none',
  onClick: () => {},
})

const noopHandler = () => false

export function BodyFrontSilhouette({ className }: BodyFrontSilhouetteProps) {
  const { user } = useUser()
  if (user?.profile?.sex === 'Female') {
    return (
      <div className={className}>
        <FemaleBodyFrontView
          getPathProps={noopGetPathProps}
          isRegionSelected={noopHandler}
          handleRegionClick={() => {}}
          hideLabels
        />
      </div>
    )
  }

  return (
    <FrontBodyView
      getPathProps={noopGetPathProps}
      isRegionSelected={noopHandler}
      handleRegionClick={() => {}}
      hideLabels
    />
  )
}
