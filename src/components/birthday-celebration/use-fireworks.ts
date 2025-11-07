import { useEffect, useRef } from 'react'

import type { Firework, Particle } from './types'

const COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#FF69B4',
  '#BA55D3',
  '#00CED1',
]

export function useFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>(0)
  const fireworksRef = useRef<Firework[]>([])
  const lastLaunchRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createFirework = () => {
      const x = Math.random() * canvas.width
      const targetY =
        Math.random() * (canvas.height * 0.3) + canvas.height * 0.1
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      fireworksRef.current.push({
        x,
        y: canvas.height,
        targetY,
        vy: -8 - Math.random() * 4,
        color,
        exploded: false,
        particles: [],
      })
    }

    const createParticles = (firework: Firework) => {
      const particleCount = 50 + Math.floor(Math.random() * 50)

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const velocity = 2 + Math.random() * 4
        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity

        firework.particles.push({
          x: firework.x,
          y: firework.y,
          vx,
          vy,
          color: firework.color,
          life: 1,
          maxLife: 1,
          size: 2 + Math.random() * 2,
        })
      }
    }

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1
      particle.vx *= 0.98
      particle.vy *= 0.98
      particle.life -= 0.01
    }

    const drawParticle = (particle: Particle) => {
      ctx.globalAlpha = particle.life
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    }

    const animate = (timestamp: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (timestamp - lastLaunchRef.current > 800 + Math.random() * 400) {
        createFirework()
        lastLaunchRef.current = timestamp
      }

      fireworksRef.current = fireworksRef.current.filter((firework) => {
        if (!firework.exploded) {
          firework.y += firework.vy
          firework.vy += 0.1

          ctx.globalAlpha = 1
          ctx.fillStyle = firework.color
          ctx.beginPath()
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2)
          ctx.fill()

          if (firework.y <= firework.targetY || firework.vy > 0) {
            firework.exploded = true
            createParticles(firework)
          }

          return true
        }

        firework.particles = firework.particles.filter((particle) => {
          updateParticle(particle)
          drawParticle(particle)
          return particle.life > 0
        })

        return firework.particles.length > 0
      })

      ctx.globalAlpha = 1
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animationIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return canvasRef
}
