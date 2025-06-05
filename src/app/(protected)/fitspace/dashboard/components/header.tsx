'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { UserWithSession } from '@/types/UserWithSession'

type HeaderProps = {
  user: UserWithSession['user']
}

export function Header({ user }: HeaderProps) {
  const currentPartOfDay = getCurrentPartOfDay()
  const randomPhrase = useMemo(
    () => welcomePhrases[Math.floor(Math.random() * welcomePhrases.length)],
    [],
  )

  // Split the quote into words for animation
  const words = useMemo(
    () =>
      randomPhrase.quote
        .split('')
        .map((char) => (char === ' ' ? '\u00A0' : char)),
    [randomPhrase.quote],
  )

  const [visibleWords, setVisibleWords] = useState<string[]>([])
  const [showAuthor, setShowAuthor] = useState(false)

  useEffect(() => {
    // Reset states when component mounts or phrase changes
    setVisibleWords([])
    setShowAuthor(false)

    // Animate words appearing one by one
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        // Update state only once per character
        setVisibleWords(words.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowAuthor(true), 300)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [randomPhrase.quote, words])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">
        Good {currentPartOfDay}, {user.profile?.firstName}!
      </h2>
      <div className={randomPhrase.author ? 'min-h-[3rem]' : 'min-h-[1.5rem]'}>
        <AnimatePresence>
          {visibleWords.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                mass: 0.5,
              }}
              className="inline-block text-muted-foreground italic text-sm whitespace-pre-wrap"
            >
              {word}
            </motion.span>
          ))}
          {showAuthor && randomPhrase.author && (
            <motion.p
              className="text-muted-foreground text-xs pl-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 12,
              }}
            >
              - {randomPhrase.author}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function getCurrentPartOfDay() {
  const currentTime = new Date()

  const currentHour = currentTime.getHours()

  if (currentHour < 12) {
    return 'morning'
  }

  if (currentHour < 18) {
    return 'afternoon'
  }

  return 'evening'
}

export const welcomePhrases: { quote: string; author?: string }[] = [
  // Ronnie Coleman
  { quote: 'Yeah buddy! Lightweight baby!', author: 'Ronnie Coleman' },
  {
    quote:
      'Everybody wants to be a bodybuilder, but don’t nobody wanna lift no heavy-ass weight.',
    author: 'Ronnie Coleman',
  },
  { quote: 'Ain’t nothin’ but a peanut!', author: 'Ronnie Coleman' },
  { quote: 'Woo! That’s what I’m talkin’ about!', author: 'Ronnie Coleman' },
  { quote: 'Ain’t nobody gonna lift it for you!', author: 'Ronnie Coleman' },

  // Arnold Schwarzenegger
  {
    quote: 'The worst thing I can be is the same as everybody else.',
    author: 'Arnold Schwarzenegger',
  },
  {
    quote:
      'The mind is the limit. As long as the mind can envision it, you can do it.',
    author: 'Arnold Schwarzenegger',
  },
  {
    quote: 'The last three or four reps is what makes the muscle grow.',
    author: 'Arnold Schwarzenegger',
  },
  {
    quote: 'Milk is for babies. When you grow up you have to drink beer.',
    author: 'Arnold Schwarzenegger',
  },
  {
    quote: "It's simple: if it jiggles, it's fat.",
    author: 'Arnold Schwarzenegger',
  },

  // Jay Cutler
  {
    quote: 'To be successful in bodybuilding, you have to be selfish.',
    author: 'Jay Cutler',
  },
  {
    quote: 'Size is the prize, and swole is the goal.',
    author: 'Jay Cutler',
  },
  {
    quote: 'Everybody wants to be big, but nobody wants to lift heavy weight.',
    author: 'Jay Cutler',
  },

  // Kai Greene
  {
    quote: 'Thoughts become things.',
    author: 'Kai Greene',
  },
  {
    quote:
      'A true champion isn’t judged by how hard he hits, but by how hard he gets hit and keeps going.',
    author: 'Kai Greene',
  },
  {
    quote: 'It’s not about the trophy. It’s about the process.',
    author: 'Kai Greene',
  },

  // Dorian Yates
  {
    quote: 'You must do what others don’t to achieve what others won’t.',
    author: 'Dorian Yates',
  },
  {
    quote: 'Stimulate, don’t annihilate.',
    author: 'Dorian Yates',
  },
  {
    quote: 'Intensity builds immensity.',
    author: 'Dorian Yates',
  },

  // Rich Piana
  {
    quote: 'Whatever it takes.',
    author: 'Rich Piana',
  },
  {
    quote: 'Eat big, get big!',
    author: 'Rich Piana',
  },
  {
    quote: 'If you want to be big, you gotta eat like you’re already big.',
    author: 'Rich Piana',
  },
  {
    quote: 'It’s 5% mentality — 5% of people do whatever it takes.',
    author: 'Rich Piana',
  },

  // Others
  {
    quote: 'Train insane or remain the same.',
    author: 'Greg Plitt',
  },
  {
    quote: 'The pain you feel today will be the strength you feel tomorrow.',
    author: 'Greg Plitt',
  },
  {
    quote: 'I don’t eat for taste, I eat for function.',
    author: 'Branch Warren',
  },
]
