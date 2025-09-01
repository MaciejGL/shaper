'use client'

import { ReturnToApp } from './components/return-to-app'

export function NavigateBack() {
  return (
    <div className="fixed top-0 left-0 w-full flex items-center bg-background z-50 p-2">
      <div className="container-hypertro min-h-0 h-max mx-auto">
        <ReturnToApp variant="back" />
      </div>
    </div>
  )
}
