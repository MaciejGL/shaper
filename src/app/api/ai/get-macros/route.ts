import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/getUser'
import { openai } from '@/lib/open-ai/open-ai'

const requestSchema = z.object({
  ingredientName: z.string().min(1, 'Ingredient name is required'),
})

const macroSchema = z.object({
  caloriesPer100g: z.number().min(0),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { ingredientName } = requestSchema.parse(body)

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert that provides accurate macronutrient data for food ingredients. 
          
Analyze the given ingredient and provide nutritional information per 100g.

Rules:
- Provide realistic, accurate macronutrient values
- Products not specified as cooked or processed should be considered raw
- Base estimates on common nutritional databases (USDA, etc.)
- Macros should be compared to several sources to ensure accuracy
- If the ingredient is ambiguous, use the most common variant
- Set confidence based on how specific the ingredient name is
- For processed foods, make reasonable estimates
- All values should be per 100g of the ingredient
- Calories should roughly match: (protein * 4) + (carbs * 4) + (fat * 9)

Confidence levels:
- high: Specific, well-known ingredient (e.g., "chicken breast", "white rice")
- medium: Somewhat ambiguous but reasonable estimates possible (e.g., "bread", "yogurt")
- low: Very generic or unusual ingredient where estimates are rough (e.g., "sauce", "mixed vegetables")`,
        },
        {
          role: 'user',
          content: `Provide macronutrient data for: "${ingredientName}"`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'macro_data',
          schema: {
            type: 'object',
            properties: {
              caloriesPer100g: {
                type: 'number',
                description: 'Calories per 100g',
              },
              proteinPer100g: {
                type: 'number',
                description: 'Protein in grams per 100g',
              },
              carbsPer100g: {
                type: 'number',
                description: 'Carbohydrates in grams per 100g',
              },
              fatPer100g: {
                type: 'number',
                description: 'Fat in grams per 100g',
              },
              confidence: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
                description: 'Confidence level in the estimates',
              },
              notes: {
                type: 'string',
                description:
                  'Optional notes about the estimates or assumptions made',
              },
            },
            required: [
              'caloriesPer100g',
              'proteinPer100g',
              'carbsPer100g',
              'fatPer100g',
              'confidence',
            ],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.1, // Low temperature for consistent results
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from AI model')
    }

    // Parse and validate the AI response
    const macroData = macroSchema.parse(JSON.parse(responseContent))

    return NextResponse.json({
      success: true,
      data: macroData,
    })
  } catch (error) {
    console.error('AI macro generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate macro data' },
      { status: 500 },
    )
  }
}
