import { DroppableDay } from './droppable-day'

export function DayGrid() {
  return (
    <div className="flex gap-4 w-max h-full">
      {Array.from({ length: 7 }).map((_, index) => (
        <DroppableDay key={index} dayIndex={index} />
      ))}
    </div>
  )
}
