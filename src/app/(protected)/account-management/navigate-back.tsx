'use client'

import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function NavigateBack() {
  return (
    <div className="fixed top-0 left-0 w-full h-12 flex items-center bg-background">
      <div className="container-hypertro mx-auto">
        <Button
          variant="variantless"
          onClick={() => window.close()}
          iconStart={<ArrowLeft />}
        >
          Back
        </Button>
      </div>
    </div>
  )
}
