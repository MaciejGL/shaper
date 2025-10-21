'use client'

import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MealSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MealSearchInput({
  value,
  onChange,
  placeholder = 'Search meals by name, ingredient, or description...',
}: MealSearchInputProps) {
  return (
    <div className="relative">
      <Input
        id="meal-search"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="secondary"
        iconStart={<Search />}
      />
      {value && (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 -translate-y-1/2"
          iconOnly={<X />}
        />
      )}
    </div>
  )
}
