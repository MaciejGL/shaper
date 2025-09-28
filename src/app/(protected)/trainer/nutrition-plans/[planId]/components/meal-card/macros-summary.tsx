interface MacrosSummaryProps {
  macros: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export function MacrosSummary({ macros }: MacrosSummaryProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center bg-muted/30 rounded-lg p-2">
        <div className="text-lg font-semibold text-primary">
          {Math.round(macros?.calories || 0)}
        </div>
        <div className="text-xs text-muted-foreground">calories</div>
      </div>
      <div className="text-center bg-muted/30 rounded-lg p-2">
        <div className="text-lg font-semibold text-green-600">
          {Math.round(macros?.protein || 0)}g
        </div>
        <div className="text-xs text-muted-foreground">protein</div>
      </div>
      <div className="text-center bg-muted/30 rounded-lg p-2">
        <div className="text-lg font-semibold text-blue-600">
          {Math.round(macros?.carbs || 0)}g
        </div>
        <div className="text-xs text-muted-foreground">carbs</div>
      </div>
      <div className="text-center bg-muted/30 rounded-lg p-2">
        <div className="text-lg font-semibold text-yellow-600">
          {Math.round(macros?.fat || 0)}g
        </div>
        <div className="text-xs text-muted-foreground">fat</div>
      </div>
    </div>
  )
}
