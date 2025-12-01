'use client'

import { useUser } from '@/context/user-context'

import { FemaleBodyFrontView } from './female-body-front/female-body-front'
import { MaleBodyFrontView } from './male-body-front/male-body-front'

interface BodyFrontSilhouetteProps {
  className?: string
}

const noopGetPathProps = () => ({
  className: 'fill-[#424747] dark:fill-muted-foreground/10 pointer-events-none',
  onClick: () => {},
})

export function BodyFrontSilhouette({ className }: BodyFrontSilhouetteProps) {
  const { user } = useUser()
  if (user?.profile?.sex === 'Female') {
    return (
      <div className={className}>
        <FemaleBodyFrontView getPathProps={noopGetPathProps} />
      </div>
    )
  }

  return (
    <div className={className}>
      <MaleBodyFrontView getPathProps={noopGetPathProps} />
    </div>
  )
}
