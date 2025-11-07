export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  maxLife: number
  size: number
}

export interface Firework {
  x: number
  y: number
  targetY: number
  vy: number
  color: string
  exploded: boolean
  particles: Particle[]
}

export interface BirthdayCelebrationProps {
  onDismiss: () => void
}
