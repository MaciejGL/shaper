export function getFakeUserCount(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return 47 + Math.abs(hash % 300)
}

export function formatUserCount(count: number): string | null {
  // Don't show if 0 users
  if (count === 0) {
    return null
  }

  // 5-9 users
  if (count >= 5 && count < 10) {
    return '5+'
  }

  // 10-49 users
  if (count >= 10 && count < 50) {
    return '10+'
  }

  // 50-99 users
  if (count >= 50 && count < 100) {
    return '50+'
  }

  // 100-199 users
  if (count >= 100 && count < 200) {
    return '100+'
  }

  // 200-299 users
  if (count >= 200 && count < 300) {
    return '200+'
  }

  // 300+ users (increment by 100)
  if (count >= 300) {
    const roundedDown = Math.floor(count / 100) * 100
    return `${roundedDown}+`
  }

  // 1-4 users - show exact count
  return `${count}`
}
