'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Control, useFieldArray } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

interface InstructionsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function InstructionsSection({ control }: InstructionsSectionProps) {
  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: 'instructions',
  })

  const addInstruction = () => {
    appendInstruction('')
  }

  const removeInstructionStep = (index: number) => {
    if (instructionFields.length > 1) {
      removeInstruction(index)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Instructions</FormLabel>
      </div>

      <div className="space-y-2">
        {instructionFields.map((field, index: number) => (
          <div key={field.id} className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-8">
              {index + 1}.
            </span>
            <FormField
              control={control}
              name={`instructions.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      id={`instruction-${index}`}
                      placeholder="Enter instruction step..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {instructionFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstructionStep(index)}
                iconOnly={<Trash2 />}
              />
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="w-max ml-auto"
          onClick={addInstruction}
          iconStart={<Plus />}
        >
          Add Step
        </Button>
      </div>
    </div>
  )
}
