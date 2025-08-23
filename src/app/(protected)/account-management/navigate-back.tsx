'use client'

import { ReturnToApp } from './components/return-to-app'

export function NavigateBack() {
  return (
    <div className="fixed top-0 left-0 w-full h-12 flex items-center bg-background z-50">
      <div className="container-hypertro mx-auto">
        <ReturnToApp variant="back" />
      </div>
    </div>
  )
}
