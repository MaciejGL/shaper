function snapToStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0
  if (!Number.isFinite(step) || step <= 0) return value
  return Math.round(value / step) * step
}

export function shouldUseTwoDecimals(value: number): boolean {
  // show 2 decimals for 0.25 / 0.75 style steps (e.g. 1.25kg)
  const rounded = Math.round(value * 100) / 100
  const fractional = Math.abs(rounded % 1)
  if (fractional === 0) return false
  // if it's .5 exactly, 1 decimal is enough; otherwise 2
  return Math.abs(fractional - 0.5) > 1e-6
}

export function buildDeltaOptions(range: {
  minDelta: number
  maxDelta: number
  step: number
}): number[] {
  const step = range.step
  const min = range.minDelta
  const max = range.maxDelta
  if (!Number.isFinite(step) || step <= 0) return []
  if (!Number.isFinite(min) || min <= 0) return []
  if (!Number.isFinite(max) || max <= 0) return []

  const unique: number[] = []
  const push = (v: number) => {
    const snapped = snapToStep(v, step)
    if (snapped <= 0) return
    if (snapped > max + 1e-9) return
    if (unique.some((o) => Math.abs(o - snapped) < 1e-6)) return
    unique.push(snapped)
  }

  push(min)
  push(min + step)
  push(max)

  return unique.sort((a, b) => a - b).slice(0, 3)
}

