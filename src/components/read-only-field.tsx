export function ReadOnlyField({ value }: { value: string }) {
  return (
    <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded min-h-9">
      {value}
    </div>
  )
}
