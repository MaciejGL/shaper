import { CoffeeIcon } from 'lucide-react'

import { BiggyIcon } from '@/components/biggy-icon'

export function RestDay() {
  return (
    <div className="text-center p-6 text-muted-foreground flex-center flex-col pt-16">
      <BiggyIcon icon={CoffeeIcon} />
      <p className="text-lg font-medium mb-2 mt-6">Rest up today</p>
      <p className="text-sm leading-relaxed">
        This is when your body actually builds muscle. Focus on recovery - food,
        hydration, sleep. See you next session.
      </p>
    </div>
  )
}
