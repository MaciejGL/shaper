'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { BirthdayCelebrationProps } from './types'
import { useFireworks } from './use-fireworks'

export function BirthdayCelebration({ onDismiss }: BirthdayCelebrationProps) {
  const canvasRef = useFireworks()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="relative z-10 mx-4 max-w-2xl"
      >
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onDismiss}
            className="absolute right-4 top-4 z-20"
            iconOnly={<X />}
          />

          <CardHeader className="pb-4 text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardTitle className="text-4xl font-bold md:text-5xl">
                🎉 Happy Birthday, Dawid! 🎂
              </CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 pb-8 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4 text-lg"
            >
              <p className="text-xl font-semibold text-foreground">
                Today we celebrate an incredible person!
              </p>

              <div className="space-y-3 text-muted-foreground">
                <p>
                  Your dedication and hard work inspire everyone around you.
                </p>
                <p>
                  From running your successful supplement store to helping
                  clients transform their lives as an exceptional personal
                  trainer, you make a real difference.
                </p>
                <p>
                  Your promising bodybuilding career shows what commitment can
                  achieve.
                </p>
                <p>
                  And of course, you have the most fantastic dog who&apos;s
                  lucky to have you! 🐕
                </p>
              </div>

              <p className="pt-4 text-xl font-bold text-primary">
                Here&apos;s to another amazing year ahead! 🎊
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                onClick={onDismiss}
                size="lg"
                className="mt-4 text-lg"
              >
                Thank You! 🎉
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

