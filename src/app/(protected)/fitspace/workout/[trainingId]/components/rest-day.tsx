import { HamIcon } from 'lucide-react'

export function RestDay() {
  return (
    <div className="text-center p-6 text-muted-foreground flex-center flex-col mt-12">
      <div className="flex-center flex-col bg-primary/10 rounded-full p-4 mb-4">
        <HamIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium mb-2">
        Time to recharge those batteries!
      </p>
      <p className="text-sm">
        Grab some good food, catch those Z's, and let's crush it on another
        workout!
      </p>
    </div>
  )
}
