import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

/**
 * Nutrition plan data for PDF generation
 */
export type NutritionPlanPDFData = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>

/**
 * Single day data for PDF generation
 */
export type NutritionDayPDFData = NutritionPlanPDFData['days'][number]

/**
 * Single meal data for PDF generation
 */
export type NutritionMealPDFData = NutritionDayPDFData['meals'][number]
