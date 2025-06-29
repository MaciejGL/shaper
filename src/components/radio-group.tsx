import { CopyIcon, MoreHorizontal, XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

type RadioGroupItem = {
  id: string
  value: string
  label: string
  onRemove?: () => void
  onCopy?: () => void
  disabled?: boolean
}

type RadioGroupProps = {
  title: string
  items: RadioGroupItem[]
  onValueChange: (value: string) => void
  value: string
  hideTitle?: boolean
  classNameItem?: string
  className?: string
}

export function RadioGroupTabs({
  title,
  items,
  onValueChange,
  value,
  hideTitle,
  className,
  classNameItem,
}: RadioGroupProps) {
  return (
    <div>
      <Label className={cn('mb-2 block', hideTitle && 'sr-only')}>
        {title}
      </Label>
      <RadioGroup
        value={value.toString()}
        onValueChange={onValueChange}
        className={cn('flex flex-wrap gap-2', className)}
      >
        {items.map((item) => (
          <div key={item.id} className="flex items-center">
            <div>
              <RadioGroupItem
                value={item.value.toString()}
                id={item.id}
                className="sr-only"
                disabled={item.disabled}
              />
              <Label
                htmlFor={item.id}
                className={cn(
                  'border rounded-md px-3 py-2 hover:text-accent-foreground cursor-pointer',
                  {
                    'bg-foreground text-background hover:bg-foreground hover:text-background':
                      value === item.value,
                    'hover:bg-accent': value !== item.value,
                    'opacity-50 cursor-default pointer-events-none bg-muted':
                      item.disabled,
                    'py-1': item.onCopy || item.onRemove,
                  },
                  classNameItem,
                )}
              >
                {item.label}
                {(item.onCopy || item.onRemove) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="xs"
                        iconOnly={<MoreHorizontal />}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.onCopy && (
                        <DropdownMenuItem onClick={item.onCopy}>
                          <CopyIcon />
                          Copy
                        </DropdownMenuItem>
                      )}
                      {item.onRemove && (
                        <DropdownMenuItem onClick={item.onRemove}>
                          <XIcon />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
