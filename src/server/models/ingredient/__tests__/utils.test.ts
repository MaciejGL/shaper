/**
 * Tests for ingredient utility functions
 */
import { formatIngredientName } from '../utils'

describe('formatIngredientName', () => {
  describe('basic formatting', () => {
    it('should capitalize first letter of each word', () => {
      expect(formatIngredientName('chicken breast')).toBe('Chicken Breast')
      expect(formatIngredientName('brown rice')).toBe('Brown Rice')
      expect(formatIngredientName('whole wheat flour')).toBe(
        'Whole Wheat Flour',
      )
    })

    it('should handle all uppercase input', () => {
      expect(formatIngredientName('CHICKEN BREAST')).toBe('Chicken Breast')
      expect(formatIngredientName('BROWN RICE')).toBe('Brown Rice')
      expect(formatIngredientName('WHOLE WHEAT FLOUR')).toBe(
        'Whole Wheat Flour',
      )
    })

    it('should handle mixed case input', () => {
      expect(formatIngredientName('ChIcKeN bReAsT')).toBe('Chicken Breast')
      expect(formatIngredientName('BrOwN rIcE')).toBe('Brown Rice')
      expect(formatIngredientName('WhOlE wHeAt FlOuR')).toBe(
        'Whole Wheat Flour',
      )
    })

    it('should handle single words', () => {
      expect(formatIngredientName('chicken')).toBe('Chicken')
      expect(formatIngredientName('CHICKEN')).toBe('Chicken')
      expect(formatIngredientName('chIcKeN')).toBe('Chicken')
    })
  })

  describe('whitespace handling', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(formatIngredientName('  chicken breast  ')).toBe('Chicken Breast')
      expect(formatIngredientName('\t chicken breast \n')).toBe(
        'Chicken Breast',
      )
    })

    it('should replace multiple spaces with single space', () => {
      expect(formatIngredientName('chicken   breast')).toBe('Chicken Breast')
      expect(formatIngredientName('chicken     breast')).toBe('Chicken Breast')
      expect(formatIngredientName('whole  wheat   flour')).toBe(
        'Whole Wheat Flour',
      )
    })

    it('should handle mixed whitespace types', () => {
      expect(formatIngredientName('chicken\t\tbreast')).toBe('Chicken Breast')
      expect(formatIngredientName('chicken\n\nbreast')).toBe('Chicken Breast')
    })
  })

  describe('special replacements', () => {
    it('should replace "w/" with "with"', () => {
      expect(formatIngredientName('chicken w/ rice')).toBe('Chicken with Rice')
      expect(formatIngredientName('pasta w/ sauce')).toBe('Pasta with Sauce')
      expect(formatIngredientName('salad w/ dressing')).toBe(
        'Salad with Dressing',
      )
    })

    it('should handle "W/" (uppercase)', () => {
      expect(formatIngredientName('chicken W/ rice')).toBe('Chicken with Rice')
      expect(formatIngredientName('CHICKEN W/ RICE')).toBe('Chicken with Rice')
    })
  })

  describe('preposition handling', () => {
    it('should lowercase common prepositions', () => {
      expect(formatIngredientName('chicken of the sea')).toBe(
        'Chicken of the Sea',
      )
      expect(formatIngredientName('rice in the bowl')).toBe('Rice in the Bowl')
      expect(formatIngredientName('bread on the table')).toBe(
        'Bread on the Table',
      )
      expect(formatIngredientName('meat at the store')).toBe(
        'Meat at the Store',
      )
      expect(formatIngredientName('sauce by the chef')).toBe(
        'Sauce by the Chef',
      )
      expect(formatIngredientName('pasta for dinner')).toBe('Pasta for Dinner')
      expect(formatIngredientName('salad with dressing')).toBe(
        'Salad with Dressing',
      )
      expect(formatIngredientName('milk from the farm')).toBe(
        'Milk from the Farm',
      )
      expect(formatIngredientName('bread to go')).toBe('Bread to Go')
      expect(formatIngredientName('cheese under the grill')).toBe(
        'Cheese under the Grill',
      )
      expect(formatIngredientName('vegetables over rice')).toBe(
        'Vegetables over Rice',
      )
    })

    it('should capitalize prepositions when they are the first word', () => {
      expect(formatIngredientName('of the sea tuna')).toBe('Of the Sea Tuna')
      expect(formatIngredientName('in the bag rice')).toBe('In the Bag Rice')
      expect(formatIngredientName('by the farm eggs')).toBe('By the Farm Eggs')
      expect(formatIngredientName('for the family bread')).toBe(
        'For the Family Bread',
      )
      expect(formatIngredientName('with extra cheese')).toBe(
        'With Extra Cheese',
      )
      expect(formatIngredientName('from italy pasta')).toBe('From Italy Pasta')
      expect(formatIngredientName('to go coffee')).toBe('To Go Coffee')
      expect(formatIngredientName('under the sea salt')).toBe(
        'Under the Sea Salt',
      )
      expect(formatIngredientName('over the hill honey')).toBe(
        'Over the Hill Honey',
      )
    })
  })

  describe('conjunction handling', () => {
    it('should lowercase common conjunctions', () => {
      expect(formatIngredientName('chicken and rice')).toBe('Chicken and Rice')
      expect(formatIngredientName('bread or toast')).toBe('Bread or Toast')
      expect(formatIngredientName('meat but not fish')).toBe(
        'Meat but Not Fish',
      )
    })

    it('should capitalize conjunctions when they are the first word', () => {
      expect(formatIngredientName('and some salt')).toBe('And Some Salt')
      expect(formatIngredientName('or something else')).toBe(
        'Or Something Else',
      )
      expect(formatIngredientName('but not this')).toBe('But Not This')
    })
  })

  describe('article handling', () => {
    it('should lowercase articles', () => {
      expect(formatIngredientName('chicken the best')).toBe('Chicken the Best')
      expect(formatIngredientName('eat a apple')).toBe('Eat a Apple')
      expect(formatIngredientName('have an orange')).toBe('Have an Orange')
    })

    it('should capitalize articles when they are the first word', () => {
      expect(formatIngredientName('the chicken')).toBe('The Chicken')
      expect(formatIngredientName('a apple')).toBe('A Apple')
      expect(formatIngredientName('an orange')).toBe('An Orange')
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple formatting rules in one string', () => {
      expect(formatIngredientName('chicken w/ rice and vegetables')).toBe(
        'Chicken with Rice and Vegetables',
      )
      expect(formatIngredientName('PASTA W/ SAUCE OF THE HOUSE')).toBe(
        'Pasta with Sauce of the House',
      )
      expect(formatIngredientName('  bread   or   toast  w/  butter  ')).toBe(
        'Bread or Toast with Butter',
      )
    })

    it('should handle realistic ingredient names', () => {
      expect(formatIngredientName('organic free range chicken breast')).toBe(
        'Organic Free Range Chicken Breast',
      )
      expect(formatIngredientName('extra virgin olive oil from italy')).toBe(
        'Extra Virgin Olive Oil from Italy',
      )
      expect(formatIngredientName('whole grain bread w/ seeds and nuts')).toBe(
        'Whole Grain Bread with Seeds and Nuts',
      )
      expect(formatIngredientName('grass fed beef for the grill')).toBe(
        'Grass Fed Beef for the Grill',
      )
    })

    it('should handle edge cases with multiple prepositions', () => {
      expect(formatIngredientName('sauce of the house by the chef')).toBe(
        'Sauce of the House by the Chef',
      )
      expect(formatIngredientName('rice from the farm in the valley')).toBe(
        'Rice from the Farm in the Valley',
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty and invalid inputs', () => {
      expect(formatIngredientName('')).toBe('')
      expect(formatIngredientName('   ')).toBe('')
      expect(formatIngredientName('\t\n')).toBe('')
    })

    it('should handle null and undefined inputs', () => {
      expect(formatIngredientName(null as unknown as string)).toBe('')
      expect(formatIngredientName(undefined as unknown as string)).toBe('')
    })

    it('should handle non-string inputs', () => {
      expect(formatIngredientName(123 as unknown as string)).toBe('')
      expect(formatIngredientName({} as unknown as string)).toBe('')
      expect(formatIngredientName([] as unknown as string)).toBe('')
    })

    it('should handle very long ingredient names', () => {
      const longName =
        'very long ingredient name with many words that goes on and on and on'
      const expected =
        'Very Long Ingredient Name with Many Words That Goes on and on and on'
      expect(formatIngredientName(longName)).toBe(expected)
    })

    it('should handle special characters', () => {
      expect(formatIngredientName('chicken-breast')).toBe('Chicken-Breast')
      expect(formatIngredientName('chicken_breast')).toBe('Chicken_Breast')
      expect(formatIngredientName('chicken.breast')).toBe('Chicken.Breast')
      expect(formatIngredientName("chicken's breast")).toBe("Chicken's Breast")
    })

    it('should handle numbers in ingredient names', () => {
      expect(formatIngredientName('vitamin d3')).toBe('Vitamin D3')
      expect(formatIngredientName('omega 3 fish oil')).toBe('Omega 3 Fish Oil')
      expect(formatIngredientName('2% milk')).toBe('2% Milk')
    })
  })

  describe('performance and consistency', () => {
    it('should be idempotent (running twice should give same result)', () => {
      const input = 'chicken w/ rice and vegetables'
      const firstRun = formatIngredientName(input)
      const secondRun = formatIngredientName(firstRun)
      expect(firstRun).toBe(secondRun)
    })

    it('should handle a variety of common ingredient formats', () => {
      const testCases = [
        { input: 'chicken breast', expected: 'Chicken Breast' },
        { input: 'GROUND BEEF', expected: 'Ground Beef' },
        { input: 'whole wheat pasta', expected: 'Whole Wheat Pasta' },
        { input: 'extra virgin olive oil', expected: 'Extra Virgin Olive Oil' },
        { input: 'sea salt', expected: 'Sea Salt' },
        { input: 'black pepper', expected: 'Black Pepper' },
        { input: 'fresh basil', expected: 'Fresh Basil' },
        { input: 'cheddar cheese', expected: 'Cheddar Cheese' },
        { input: 'greek yogurt', expected: 'Greek Yogurt' },
        { input: 'brown sugar', expected: 'Brown Sugar' },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatIngredientName(input)).toBe(expected)
      })
    })
  })
})
