import { ChefHat } from 'lucide-react'

interface CookingInstructionsProps {
  instructions: string[]
}

export function CookingInstructions({
  instructions,
}: CookingInstructionsProps) {
  if (!instructions || instructions.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ChefHat className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">Cooking Instructions</h4>
      </div>
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
              {index + 1}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground pt-1">
              {instruction}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
