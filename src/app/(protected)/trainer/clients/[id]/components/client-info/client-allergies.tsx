export function ClientAllergies({ allergies }: { allergies?: string | null }) {
  if (!allergies) {
    return null
  }

  return (
    <div className="pt-2">
      <h4 className="font-medium mb-2">Allergies</h4>
      <p className="text-sm text-muted-foreground">{allergies}</p>
    </div>
  )
}
