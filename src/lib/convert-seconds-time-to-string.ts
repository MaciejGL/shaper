export const convertSecondsToTimeString = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes > 1) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}m`
  }
  if (minutes === 1 && remainingSeconds > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}m`
  }
  return `${seconds}s`
}
