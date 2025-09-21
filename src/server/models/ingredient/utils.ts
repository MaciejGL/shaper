/**
 * Formats an ingredient name by cleaning up common typing mistakes and ensuring proper capitalization
 */
export function formatIngredientName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  return name
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .toLowerCase() // Convert to lowercase first
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .replace(/\bW\//g, 'With') // Replace "w/" with "With"
    .replace(/\bAnd\b/g, 'and') // Lowercase common conjunctions
    .replace(/\bOr\b/g, 'or')
    .replace(/\bBut\b/g, 'but')
    .replace(/\bOf\b/g, 'of') // Lowercase common prepositions
    .replace(/\bIn\b/g, 'in')
    .replace(/\bOn\b/g, 'on')
    .replace(/\bAt\b/g, 'at')
    .replace(/\bBy\b/g, 'by')
    .replace(/\bFor\b/g, 'for')
    .replace(/\bWith\b/g, 'with')
    .replace(/\bFrom\b/g, 'from')
    .replace(/\bTo\b/g, 'to')
    .replace(/\bUnder\b/g, 'under')
    .replace(/\bOver\b/g, 'over')
    .replace(/\bThe\b/g, 'the') // Lowercase articles
    .replace(/\bA\b/g, 'a')
    .replace(/\bAn\b/g, 'an')
    .replace(
      /^(and|or|but|of|in|on|at|by|for|with|from|to|under|over|the|a|an)\b/,
      (match) => match.charAt(0).toUpperCase() + match.slice(1), // Capitalize if it's the first word
    )
}
