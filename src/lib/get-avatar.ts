export const getAvatar = (sex?: string | null, image?: string | null) => {
  if (image) return image
  if (sex === 'male') return '/avatar-male.png'
  if (sex === 'female') return '/avatar-female.png'
  return '/avatar-neutral.png'
}
