'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface TypewriterTextProps {
  paragraphs: string[]
  /** Used to restart animation when content changes */
  animationKey: string
  /** Delay between paragraphs */
  paragraphDelay?: number
  /** Delay between characters */
  charStagger?: number
}

export function TypewriterText({
  paragraphs,
  animationKey,
  paragraphDelay = 0.22,
  charStagger = 0.008,
}: TypewriterTextProps) {
  const reduceMotion = useReducedMotion()

  const paragraphStartDelays = paragraphs.reduce<number[]>((acc, _p, idx) => {
    if (idx === 0) return [0]
    const prevDelay = acc[idx - 1] ?? 0
    const prevChars = Array.from(paragraphs[idx - 1] ?? '').length
    const prevDuration = prevChars * charStagger + paragraphDelay
    return [...acc, prevDelay + prevDuration]
  }, [])

  if (reduceMotion) {
    return (
      <>
        {paragraphs.map((p, idx) => (
          <p
            key={`${animationKey}-${idx}`}
            className={idx === 0 ? undefined : 'mt-2'}
          >
            {p}
          </p>
        ))}
      </>
    )
  }

  return (
    <>
      {paragraphs.map((p, idx) => (
        <motion.p
          key={`${animationKey}-${idx}`}
          className={
            idx === 0 ? 'whitespace-pre-wrap' : 'mt-2 whitespace-pre-wrap'
          }
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                delayChildren: paragraphStartDelays[idx] ?? 0,
                staggerChildren: charStagger,
              },
            },
          }}
        >
          {Array.from(p).map((ch, chIdx) => (
            <motion.span
              key={chIdx}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.p>
      ))}
    </>
  )
}
