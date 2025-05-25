import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'

const variants = {
  blur: {
    initial: {
      opacity: 0,
      y: 10,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: 'blur(4px)',
    },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  scale: {
    initial: {
      opacity: 0,
      scale: 0.98,
      transformOrigin: 'center center',
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.01,
    },
    transition: {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1],
    },
  },
  rotate: {
    initial: {
      opacity: 0,
      x: 20,
      rotateY: -5,
      transformPerspective: 1000,
    },
    animate: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transformPerspective: 1000,
    },
    exit: {
      opacity: 0,
      x: -20,
      rotateY: 5,
      transformPerspective: 1000,
    },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.3 },
    },
  },
  slide: {
    initial: {
      opacity: 0,
      clipPath: 'inset(0 100% 0 0)',
      background:
        'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    },
    animate: {
      opacity: 1,
      clipPath: 'inset(-10px -10px -10px -10px)',
      background:
        'linear-gradient(90deg, transparent, transparent, transparent)',
    },
    exit: {
      opacity: 0,
      clipPath: 'inset(0 0 0 100%)',
      background:
        'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      clipPath: { duration: 0.4 },
    },
  },
  reveal: {
    initial: {
      opacity: 0,
      maskImage: 'linear-gradient(to right, transparent, black, transparent)',
      maskSize: '200% 100%',
      maskPosition: '-100% 0',
    },
    animate: {
      opacity: 1,

      maskImage: 'none',
      maskSize: 'auto',
      maskPosition: '0 0',
    },
    exit: {
      opacity: 0,
      maskPosition: '200% 0',
    },
    transition: {
      duration: 0.3, // Increased duration for smoother animation
      ease: [0.4, 0, 0.2, 1],
      maskPosition: {
        duration: 0.2, // Match the main duration
        ease: [0.4, 0, 0.2, 1], // Add easing to mask position
      },
      opacity: {
        duration: 0.2, // Match the main duration
        ease: [0.4, 0, 0.2, 1], // Add easing to opacity
      },
    },
  },
  fade: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
    transition: {
      duration: 0.1,
    },
  },
}

export function AnimatedPageTransition({
  children,
  className,
  variant = 'reveal',
  id,
}: {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof variants
  id: string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={id} {...variants[variant]} className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
