'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Control, UseFormSetValue, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import { CreateCustomMealForm } from './create-custom-meal-dialog'

interface InstructionsSectionProps {
  control: Control<CreateCustomMealForm>
  setValue: UseFormSetValue<CreateCustomMealForm>
}

export function InstructionsSection({
  control,
  setValue,
}: InstructionsSectionProps) {
  const instructions = useWatch({
    control,
    name: 'instructions',
    defaultValue: [''],
  })

  const addInstruction = () => {
    setValue('instructions', [...instructions, ''])
  }

  const removeInstructionStep = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index)
      setValue('instructions', newInstructions)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Instructions</FormLabel>
      </div>

      <div className="space-y-2">
        {instructions.map((instruction: string, index: number) => (
          <div key={index} className="flex items-start gap-2">
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
            {instructions.length > 1 && (
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
