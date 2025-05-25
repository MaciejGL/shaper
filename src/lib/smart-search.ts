type SearchableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SearchableValue[]
  | { [key: string]: SearchableValue }
type SearchableObject = Record<string, SearchableValue>

/**
 * Performs a smart search across multiple fields of an object
 * @param items Array of objects to search through
 * @param searchTerm Search term to look for
 * @param searchFields Array of field paths to search in (e.g., ['firstName', 'profile.goal'])
 * @returns Filtered array of items that match the search criteria
 */
export function smartSearch<T extends SearchableObject>(
  items: T[],
  searchTerm: string | null,
  searchFields: string[] = [],
): T[] {
  if (!searchTerm) return items

  const searchTermLower = searchTerm.toLowerCase()

  return items.filter((item) => {
    return searchFields.some((field) => {
      // Handle nested fields (e.g., 'profile.goal')
      const value = field
        .split('.')
        .reduce<SearchableValue>(
          (obj, key) =>
            typeof obj === 'object' && obj !== null && !Array.isArray(obj)
              ? (obj as Record<string, SearchableValue>)[key]
              : undefined,
          item,
        )

      // Handle different types of values
      if (value == null) return false

      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTermLower)
      }

      if (typeof value === 'number') {
        return value.toString().includes(searchTermLower)
      }

      if (Array.isArray(value)) {
        return value.some(
          (v) =>
            typeof v === 'string' && v.toLowerCase().includes(searchTermLower),
        )
      }

      return false
    })
  })
}
