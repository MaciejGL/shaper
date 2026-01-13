export type SupportedImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp'

const extensionToMimeType = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const satisfies Record<string, SupportedImageMimeType>

function getFileExtension(fileName: string): string | null {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return null
  const ext = fileName.slice(lastDotIndex + 1).trim()
  if (!ext) return null
  return ext.toLowerCase()
}

export function getImageMimeTypeFromFile(
  file: Pick<File, 'type' | 'name'>,
): SupportedImageMimeType | null {
  if (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/webp'
  ) {
    return file.type
  }

  const ext = getFileExtension(file.name)
  if (!ext) return null

  return extensionToMimeType[ext as keyof typeof extensionToMimeType] ?? null
}
