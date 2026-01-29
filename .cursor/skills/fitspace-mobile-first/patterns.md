# Fitspace Mobile Patterns Reference

Detailed examples and patterns for mobile-first development in fitspace routes.

---

## Page Layout Pattern

Standard page structure for fitspace routes:

```typescript
// src/app/(protected)/fitspace/[feature]/page.tsx
import { Main } from '@/components/main'

export default function FeaturePage() {
  return (
    <div className="container-hypertro mx-auto px-4">
      {/* Header - sticky if needed */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur py-4">
        <h1 className="text-xl font-bold">Feature Title</h1>
      </header>
      
      {/* Main content - vertical stack */}
      <div className="flex flex-col gap-4 pb-24">
        {/* Content sections */}
      </div>
      
      {/* Fixed bottom CTA - when needed */}
      <FixedBottomAction />
    </div>
  )
}

function FixedBottomAction() {
  const isKeyboardVisible = useKeyboardVisible()
  
  if (isKeyboardVisible) return null
  
  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-background/95 backdrop-blur border-t safe-area-bottom-content">
      <Button className="w-full h-12">Primary Action</Button>
    </div>
  )
}
```

---

## Exercise Card Pattern

Touch-friendly exercise display:

```typescript
function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card className="overflow-hidden">
      {/* Tappable header - full width touch target */}
      <button
        className="w-full min-h-14 flex items-center gap-3 px-4 py-3 text-left"
        onClick={handleToggle}
      >
        <div className="size-10 rounded-lg bg-primary/10 flex-center shrink-0">
          <Dumbbell className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{exercise.name}</p>
          <p className="text-sm text-muted-foreground">3 sets × 10 reps</p>
        </div>
        <ChevronDown className={cn(
          "size-5 transition-transform shrink-0",
          isExpanded && "rotate-180"
        )} />
      </button>
      
      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {exercise.sets.map(set => (
            <SetRow key={set.id} set={set} />
          ))}
        </div>
      )}
    </Card>
  )
}
```

---

## Set Input Pattern

Workout set logging with touch-optimized inputs:

```typescript
function SetRow({ set, onUpdate }: SetRowProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Set number indicator */}
      <div className="size-8 rounded-full bg-muted flex-center shrink-0">
        <span className="text-sm font-medium">{set.number}</span>
      </div>
      
      {/* Weight input - large touch target */}
      <div className="flex-1">
        <Input
          type="number"
          inputMode="decimal"
          value={set.weight}
          onChange={(e) => onUpdate({ weight: e.target.value })}
          className="h-12 text-center text-lg font-medium"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground text-center block mt-1">
          kg
        </span>
      </div>
      
      {/* Reps input */}
      <div className="flex-1">
        <Input
          type="number"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => onUpdate({ reps: e.target.value })}
          className="h-12 text-center text-lg font-medium"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground text-center block mt-1">
          reps
        </span>
      </div>
      
      {/* Complete checkbox - 44px minimum */}
      <button
        className={cn(
          "size-11 rounded-lg flex-center shrink-0 transition-colors",
          set.completed 
            ? "bg-green-500 text-white" 
            : "bg-muted hover:bg-muted/80"
        )}
        onClick={() => onUpdate({ completed: !set.completed })}
      >
        <Check className="size-5" />
      </button>
    </div>
  )
}
```

---

## Day Selector Pattern

Horizontal day navigation with proper touch targets:

```typescript
function DaySelector({ days, activeDayId, onSelect }: DaySelectorProps) {
  return (
    <div className="flex justify-between gap-1 px-2">
      {days.map((day) => {
        const isSelected = day.id === activeDayId
        
        return (
          <button
            key={day.id}
            data-selected={isSelected}
            className={cn(
              // 48x48px touch target
              "size-12 shrink-0 rounded-xl flex-center flex-col",
              "transition-all bg-card shadow-sm",
              // Selection states
              "data-[selected=false]:text-muted-foreground",
              "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
              // Press feedback
              "active:scale-95"
            )}
            onClick={() => onSelect(day.id)}
          >
            <span className="text-xs">{day.shortName}</span>
            <span className="text-md font-medium">{day.date}</span>
          </button>
        )
      })}
    </div>
  )
}
```

---

## Options Drawer Pattern

Action sheet style drawer for options:

```typescript
function WorkoutOptionsDrawer({ workout }: WorkoutOptionsDrawerProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {/* 48px touch target */}
        <Button variant="ghost" size="icon-lg" iconOnly={<MoreVertical />} />
      </DrawerTrigger>
      
      <DrawerContent dialogTitle="Workout Options">
        <DrawerHeader>
          <DrawerTitle>Options</DrawerTitle>
        </DrawerHeader>
        
        {/* Full-width option buttons */}
        <div className="px-4 pb-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full h-14 justify-start text-left"
            iconStart={<Edit />}
            onClick={handleEdit}
          >
            Edit Workout
          </Button>
          
          <Button
            variant="ghost"
            className="w-full h-14 justify-start text-left"
            iconStart={<Copy />}
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          
          <Button
            variant="ghost"
            className="w-full h-14 justify-start text-left text-destructive"
            iconStart={<Trash />}
            onClick={handleDelete}
          >
            Delete Workout
          </Button>
        </div>
        
        <DrawerFooter>
          <Button variant="secondary" className="w-full" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

---

## Confirmation Drawer Pattern

Confirmation dialogs as bottom drawers:

```typescript
function DeleteConfirmationDrawer({
  open,
  onOpenChange,
  onConfirm,
  itemName,
}: DeleteConfirmationDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Confirm Delete">
        <div className="px-4 py-6 text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-destructive/10 flex-center">
            <Trash className="size-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Delete {itemName}?</h3>
          <p className="text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>
        
        <DrawerFooter>
          <Button
            variant="destructive"
            className="w-full h-12"
            onClick={handleConfirm}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

---

## List with Swipe Actions Pattern

Swipeable list items for quick actions:

```typescript
function SwipeableExerciseItem({ exercise, onDelete }: SwipeableItemProps) {
  const [showActions, setShowActions] = useState(false)
  
  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background action buttons */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          className="w-20 bg-destructive flex-center"
          onClick={() => onDelete(exercise.id)}
        >
          <Trash className="size-5 text-white" />
        </button>
      </div>
      
      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        className="relative bg-card"
      >
        <button className="w-full min-h-14 flex items-center gap-3 px-4 py-3">
          <span>{exercise.name}</span>
        </button>
      </motion.div>
    </div>
  )
}
```

---

## Empty State Pattern

Mobile-friendly empty states:

```typescript
function EmptyWorkoutState({ onCreateWorkout }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="size-20 mb-6 rounded-full bg-primary/10 flex-center">
        <Dumbbell className="size-10 text-primary" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">No Workouts Yet</h2>
      <p className="text-muted-foreground mb-8 max-w-xs">
        Start your fitness journey by creating your first workout plan.
      </p>
      
      {/* Full-width CTA */}
      <Button 
        className="w-full max-w-xs h-12"
        iconStart={<Plus />}
        onClick={onCreateWorkout}
      >
        Create Workout
      </Button>
    </div>
  )
}
```

---

## Loading Skeleton Pattern

Mobile-optimized loading states:

```typescript
function WorkoutSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      {/* Day selector skeleton */}
      <div className="flex justify-between gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="size-12 rounded-xl" />
        ))}
      </div>
      
      {/* Exercise cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
```

---

## Tab Navigation Pattern

Horizontal tabs with proper touch targets:

```typescript
function TabNavigation({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex bg-muted rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-active={tab.id === activeTab}
          className={cn(
            "flex-1 min-h-11 rounded-md px-3 py-2 text-sm font-medium",
            "transition-colors",
            "data-[active=false]:text-muted-foreground",
            "data-[active=true]:bg-background data-[active=true]:shadow-sm"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Pull-to-Refresh Pattern

When implementing refresh functionality:

```typescript
function RefreshableList({ children, onRefresh }: RefreshableListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }
  
  return (
    <div className="relative">
      {/* Show spinner at top when refreshing */}
      {isRefreshing && (
        <div className="absolute top-0 inset-x-0 flex-center py-4">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}
      
      <div className={cn(isRefreshing && "opacity-50")}>
        {children}
      </div>
    </div>
  )
}
```

---

## Number Input Pattern

Mobile-optimized number input with increment/decrement:

```typescript
function NumberStepper({ value, onChange, min = 0, max, step = 1 }: NumberStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon-lg"
        iconOnly={<Minus />}
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
      />
      
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 h-12 text-center text-lg font-medium"
      />
      
      <Button
        variant="secondary"
        size="icon-lg"
        iconOnly={<Plus />}
        onClick={() => onChange(max ? Math.min(max, value + step) : value + step)}
        disabled={max !== undefined && value >= max}
      />
    </div>
  )
}
```
