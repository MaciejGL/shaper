import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import { formatIngredientAmount } from '@/lib/cooking-units'
import { PDFFooter, PDFHeader } from '@/lib/pdf/components/pdf-layout'
import { PDF_STYLES } from '@/lib/pdf/pdf-generator'

import type { NutritionDayPDFData, NutritionPlanPDFData } from './types'

interface NutritionPlanPDFProps {
  nutritionPlan: NutritionPlanPDFData
}

/**
 * PDF Document for Nutrition Plans
 * Generates a printable meal plan with one page per day
 */
export function NutritionPlanPDF({ nutritionPlan }: NutritionPlanPDFProps) {
  const trainerName = nutritionPlan.trainer
    ? `${nutritionPlan.trainer.firstName} ${nutritionPlan.trainer.lastName}`
    : 'Your Trainer'

  return (
    <Document>
      {nutritionPlan.days.map((day) => (
        <Page key={day.id} size="A4" style={styles.page}>
          <PDFHeader title={day.name} subtitle={nutritionPlan.name} />

          {/* Daily Macros Summary */}
          <View style={styles.dailyMacrosSummary}>
            <View style={styles.dailyMacroItem}>
              <Text style={styles.dailyMacroValue}>
                {Math.round(day.dailyMacros?.calories || 0)}
              </Text>
              <Text style={styles.dailyMacroLabel}>calories</Text>
            </View>
            <View style={styles.dailyMacroItem}>
              <Text style={[styles.dailyMacroValue, styles.proteinColor]}>
                {Math.round(day.dailyMacros?.protein || 0)}g
              </Text>
              <Text style={styles.dailyMacroLabel}>protein</Text>
            </View>
            <View style={styles.dailyMacroItem}>
              <Text style={[styles.dailyMacroValue, styles.carbsColor]}>
                {Math.round(day.dailyMacros?.carbs || 0)}g
              </Text>
              <Text style={styles.dailyMacroLabel}>carbs</Text>
            </View>
            <View style={styles.dailyMacroItem}>
              <Text style={[styles.dailyMacroValue, styles.fatColor]}>
                {Math.round(day.dailyMacros?.fat || 0)}g
              </Text>
              <Text style={styles.dailyMacroLabel}>fat</Text>
            </View>
          </View>

          {/* Meals List */}
          <View style={styles.mealsContainer}>
            {day.meals
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((planMeal, index) => (
                <MealSection
                  key={planMeal.id}
                  planMeal={planMeal}
                  mealNumber={index + 1}
                />
              ))}
          </View>

          {/* Footer - Fixed at bottom of every page */}
          <View style={styles.footer} fixed>
            <PDFFooter metadata={`${day.name} • Prepared by ${trainerName}`} />
          </View>
        </Page>
      ))}
    </Document>
  )
}

interface MealSectionProps {
  planMeal: NutritionDayPDFData['meals'][number]
  mealNumber: number
}

function MealSection({ planMeal, mealNumber }: MealSectionProps) {
  const meal = planMeal.meal
  const macros = planMeal.adjustedMacros

  return (
    <View style={styles.mealSection} wrap={false}>
      {/* Meal Header */}
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>
          {mealNumber}. {meal.name}
        </Text>
      </View>

      {/* Description */}
      {meal.description && (
        <Text style={styles.mealDescription}>{meal.description}</Text>
      )}

      {/* Macros */}
      <View style={styles.mealMacrosContainer}>
        <View style={styles.mealMacros}>
          <View style={styles.mealMacroItem}>
            <Text style={styles.mealMacroValue}>
              {Math.round(macros?.calories || 0)}
            </Text>
            <Text style={styles.mealMacroLabel}>cal</Text>
          </View>
          <View style={styles.mealMacroSeparator} />
          <View style={styles.mealMacroItem}>
            <Text style={[styles.mealMacroValue, styles.proteinColor]}>
              {Math.round(macros?.protein || 0)}g
            </Text>
            <Text style={styles.mealMacroLabel}>P</Text>
          </View>
          <View style={styles.mealMacroSeparator} />
          <View style={styles.mealMacroItem}>
            <Text style={[styles.mealMacroValue, styles.carbsColor]}>
              {Math.round(macros?.carbs || 0)}g
            </Text>
            <Text style={styles.mealMacroLabel}>C</Text>
          </View>
          <View style={styles.mealMacroSeparator} />
          <View style={styles.mealMacroItem}>
            <Text style={[styles.mealMacroValue, styles.fatColor]}>
              {Math.round(macros?.fat || 0)}g
            </Text>
            <Text style={styles.mealMacroLabel}>F</Text>
          </View>
        </View>
      </View>

      {/* Ingredients */}
      {meal.ingredients && meal.ingredients.length > 0 && (
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {meal.ingredients
              .sort((a, b) => a.order - b.order)
              .map((ingredientItem) => {
                // Use override grams if available
                const override = planMeal.ingredientOverrides?.find(
                  (o) => o.mealIngredient.id === ingredientItem.id,
                )
                const adjustedGrams = override?.grams ?? ingredientItem.grams
                const formatted = formatIngredientAmount(
                  adjustedGrams,
                  ingredientItem.ingredient.name,
                  true, // prefer metric
                )

                return (
                  <View key={ingredientItem.id} style={styles.ingredientItem}>
                    <Text style={styles.ingredientName}>
                      • {ingredientItem.ingredient.name}
                    </Text>
                    <View style={styles.ingredientDots} />
                    <Text style={styles.ingredientAmount}>
                      {formatted.display}
                    </Text>
                  </View>
                )
              })}
          </View>
        </View>
      )}

      {/* Instructions */}
      {meal.instructions && meal.instructions.length > 0 && (
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Directions</Text>
          <View style={styles.instructionsList}>
            {meal.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionStep}>Step {index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    paddingTop: PDF_STYLES.page.padding,
    paddingBottom: 80, // Extra padding for fixed footer
    paddingLeft: PDF_STYLES.page.padding,
    paddingRight: PDF_STYLES.page.padding,
    fontFamily: 'Inter',
    fontSize: PDF_STYLES.fonts.base,
    color: PDF_STYLES.colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: PDF_STYLES.page.padding,
    paddingRight: PDF_STYLES.page.padding,
    paddingBottom: PDF_STYLES.spacing.lg,
  },

  // Daily Macros Summary (full width, no borders)
  dailyMacrosSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: PDF_STYLES.spacing.xl,
    paddingVertical: PDF_STYLES.spacing.md,
  },
  dailyMacroItem: {
    alignItems: 'center',
  },
  dailyMacroValue: {
    fontSize: PDF_STYLES.fonts.large,
    fontFamily: 'Inter',
    fontWeight: 700,
    marginBottom: PDF_STYLES.spacing.xs,
  },
  dailyMacroLabel: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.muted,
  },

  // Color accents
  proteinColor: {
    color: '#2563eb', // blue-600
  },
  carbsColor: {
    color: '#16a34a', // green-600
  },
  fatColor: {
    color: '#ca8a04', // yellow-600
  },

  // Meals Container
  mealsContainer: {
    gap: PDF_STYLES.spacing.xl,
  },

  // Meal Section
  mealSection: {
    marginBottom: PDF_STYLES.spacing.lg,
  },
  mealHeader: {
    marginBottom: PDF_STYLES.spacing.sm,
  },
  mealTitle: {
    fontSize: PDF_STYLES.fonts.large,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: PDF_STYLES.colors.text,
  },
  mealDescription: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.muted,
    marginBottom: PDF_STYLES.spacing.sm,
    lineHeight: 1.4,
  },

  // Meal Macros (compact with borders)
  mealMacrosContainer: {
    alignItems: 'flex-start',
    marginBottom: PDF_STYLES.spacing.md,
  },
  mealMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PDF_STYLES.spacing.sm,
    paddingHorizontal: PDF_STYLES.spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PDF_STYLES.colors.border,
  },
  mealMacroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PDF_STYLES.spacing.xs,
  },
  mealMacroValue: {
    fontSize: PDF_STYLES.fonts.small,
    fontFamily: 'Inter',
    fontWeight: 600,
  },
  mealMacroLabel: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.muted,
  },
  mealMacroSeparator: {
    width: 1,
    height: 12,
    backgroundColor: PDF_STYLES.colors.border,
    marginHorizontal: PDF_STYLES.spacing.sm,
  },

  // Sections
  sectionTitle: {
    fontSize: PDF_STYLES.fonts.medium,
    fontFamily: 'Inter',
    fontWeight: 600,
    marginBottom: PDF_STYLES.spacing.sm,
  },

  // Ingredients (50% width with dots)
  ingredientsSection: {
    marginBottom: PDF_STYLES.spacing.md,
  },
  ingredientsList: {
    width: '50%',
    gap: PDF_STYLES.spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: PDF_STYLES.spacing.xs,
    paddingVertical: 2,
  },
  ingredientName: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.muted,
  },
  ingredientDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: PDF_STYLES.colors.border,
    borderStyle: 'dotted',
    marginBottom: 3,
  },
  ingredientAmount: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.text,
    fontFamily: 'Inter',
    fontWeight: 600,
  },

  // Instructions
  instructionsSection: {
    marginTop: PDF_STYLES.spacing.md,
  },
  instructionsList: {
    gap: PDF_STYLES.spacing.md,
  },
  instructionItem: {
    gap: PDF_STYLES.spacing.xs,
  },
  instructionStep: {
    fontSize: PDF_STYLES.fonts.small,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: PDF_STYLES.colors.text,
  },
  instructionText: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.muted,
    lineHeight: 1.5,
  },
})
