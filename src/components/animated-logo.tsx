'use client'

import { motion, Variants } from 'framer-motion'

import { cn } from '@/lib/utils'

export function AnimatedLogo({
  infinite = true,
  size = 200,
  forceColor = 'text-primary',
}: {
  infinite?: boolean
  size?: number
  forceColor?: string
}) {
  // Animation variants for the container
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2, // Reduced stagger for smoother flow
        delayChildren: 0.1,
      },
    },
  }

  // Animation variants for the circle (center element)
  const circleVariants: Variants = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: 0.5,
        ease: 'easeOut',
      },
    },
  } 

  // Animation variants for the paths with smooth stroke drawing effect
  const pathVariants: Variants = {
    initial: {
      strokeDasharray: '100 100', // Set up dash pattern
      strokeDashoffset: 100, // Start with path hidden
      opacity: 0,
    },
    animate: (custom: number) => ({
      strokeDashoffset: 0, // Animate to reveal the path
      opacity: 1,
      transition: {
        strokeDashoffset: {
          duration: 1, // Longer duration for smoother drawing
          ease: 'easeInOut',
          delay: custom * 0.3, // Stagger each path
          ...(infinite && {
            repeat: Infinity,
            repeatType: 'reverse',
            repeatDelay: 0.5,
          }),
        },
        opacity: {
          duration: 0.2,
          delay: custom * 0.2,
        },
      },
    }),
  } 

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Define masks for the stroke effects */}
        <defs>
          <mask id="path-2-inside-1_3370_1806" fill="white">
            <path d="M256 416.885C229.542 416.885 203.493 410.36 180.159 397.888C156.826 385.416 136.928 367.382 122.229 345.383C107.53 323.384 98.4828 298.1 95.8895 271.77C93.2961 245.439 97.2365 218.876 107.361 194.432C117.486 169.988 133.483 148.419 153.936 131.634C174.388 114.849 198.664 103.368 224.613 98.2061C250.562 93.0445 277.384 94.3621 302.703 102.042C328.021 109.723 351.055 123.529 369.763 142.237L346.146 165.854C331.321 151.03 313.069 140.09 293.007 134.004C272.945 127.918 251.691 126.874 231.129 130.964C210.567 135.054 191.331 144.153 175.124 157.453C158.918 170.753 146.242 187.844 138.219 207.214C130.196 226.583 127.074 247.632 129.129 268.496C131.184 289.36 138.352 309.395 150 326.827C161.648 344.259 177.414 358.549 195.904 368.432C214.394 378.315 235.035 383.485 256 383.485L256 416.885Z" />
          </mask>
          <mask id="path-3-inside-2_3370_1806" fill="white">
            <path d="M256 480.632C196.424 480.632 139.288 456.966 97.161 414.839C55.0342 372.712 31.3677 315.576 31.3677 256C31.3677 196.424 55.0342 139.288 97.161 97.161C139.288 55.0342 196.424 31.3677 256 31.3677L256 66.4556C205.73 66.4556 157.518 86.4254 121.972 121.972C86.4254 157.518 66.4556 205.73 66.4556 256C66.4556 306.27 86.4254 354.482 121.972 390.028C157.518 425.575 205.73 445.545 256 445.545L256 480.632Z" />
          </mask>
        </defs>

        <motion.g style={{ transformOrigin: '256px 256px' }}>
          {/* Center circle - appears first */}
          <motion.circle
            cx="256"
            cy="256"
            r="100.174"
            fill="currentColor"
            variants={circleVariants}
            className={forceColor}
          />

          {/* Middle ring with smooth progressive stroke drawing */}
          <motion.path
            d="M256 416.885C229.542 416.885 203.493 410.36 180.159 397.888C156.826 385.416 136.928 367.382 122.229 345.383C107.53 323.384 98.4828 298.1 95.8895 271.77C93.2961 245.439 97.2365 218.876 107.361 194.432C117.486 169.988 133.483 148.419 153.936 131.634C174.388 114.849 198.664 103.368 224.613 98.2061C250.562 93.0445 277.384 94.3621 302.703 102.042C328.021 109.723 351.055 123.529 369.763 142.237L346.146 165.854C331.321 151.03 313.069 140.09 293.007 134.004C272.945 127.918 251.691 126.874 231.129 130.964C210.567 135.054 191.331 144.153 175.124 157.453C158.918 170.753 146.242 187.844 138.219 207.214C130.196 226.583 127.074 247.632 129.129 268.496C131.184 289.36 138.352 309.395 150 326.827C161.648 344.259 177.414 358.549 195.904 368.432C214.394 378.315 235.035 383.485 256 383.485L256 416.885Z"
            stroke="currentColor"
            strokeWidth="100"
            fill="none"
            mask="url(#path-2-inside-1_3370_1806)"
            variants={pathVariants}
            custom={0} // First path to draw
            className={forceColor}
            pathLength="100" // Normalize path length for consistent animation
            style={{
              strokeLinecap: 'round',
              strokeLinejoin: 'round', // Smooth joins
            }}
          />

          {/* Outer ring with smooth progressive stroke drawing */}
          <motion.path
            d="M256 480.632C196.424 480.632 139.288 456.966 97.161 414.839C55.0342 372.712 31.3677 315.576 31.3677 256C31.3677 196.424 55.0342 139.288 97.161 97.161C139.288 55.0342 196.424 31.3677 256 31.3677L256 66.4556C205.73 66.4556 157.518 86.4254 121.972 121.972C86.4254 157.518 66.4556 205.73 66.4556 256C66.4556 306.27 86.4254 354.482 121.972 390.028C157.518 425.575 205.73 445.545 256 445.545L256 480.632Z"
            stroke="currentColor"
            strokeWidth="120"
            fill="none"
            mask="url(#path-3-inside-2_3370_1806)"
            variants={pathVariants}
            custom={1} // Second path to draw
            className={forceColor}
            pathLength="100" // Normalize path length for consistent animation
            style={{
              strokeLinecap: 'round',
              strokeLinejoin: 'round', // Smooth joins
            }}
          />
        </motion.g>
      </motion.svg>
    </div>
  )
}

export function AnimatedLogoText({ className }: { className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={cn('text-md font-medium', className)}
    >
      {'Fitspace'.split('').map((letter, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: {
              opacity: 0,
              y: -20,
              scale: 0.8,
            },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 15,
              },
            },
          }}
          className="inline-block"
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  )
}
