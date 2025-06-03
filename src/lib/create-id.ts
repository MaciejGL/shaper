export const createId = () => {
  return crypto.randomUUID().slice(0, 8)
}
