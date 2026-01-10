import { AnimatePresence, motion } from 'framer-motion'

import { useUserPreferences } from '@/context/user-preferences-context'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

import { sharedLayoutAdvancedStyles } from './shared-styles'
import { PRData } from './use-set-completion'

interface PROverlayProps {
  isAdvancedView: boolean
  prData: PRData | null
  onClose: () => void
}

export function PROverlay({ isAdvancedView, prData, onClose }: PROverlayProps) {
  const { preferences } = useUserPreferences()
  const { toDisplayWeight } = useWeightConversion()

  if (!isAdvancedView) return null

  return (
    <AnimatePresence mode="wait">
      {prData?.show && (
        <motion.div
          key="pr-overlay"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          exit={{ width: 0 }}
          transition={{
            duration: 1,
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          onClick={onClose}
          className={cn(
            sharedLayoutAdvancedStyles,
            'absolute left-0 top-0 bottom-0 z-10 h-full px-0',
          )}
        >
          <motion.div
            key="pr-overlay-content"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            className={cn(
              'bg-linear-to-r from-yellow-200/10 to-yellow-300/80 dark:from-amber-400/2 dark:to-amber-600/60 backdrop-blur-[5px] rounded-r-lg h-full overflow-hidden',
              'col-span-3',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-end h-full',
                'px-4 gap-4',
              )}
            >
              <motion.div
                key="pr-overlay-content-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
                className="flex justify-center items-center gap-4 overflow-hidden"
              >
                <div className={cn('font-semibold whitespace-nowrap')}>
                  <p
                    className={cn(
                      'text-[10px] leading-none font-medium whitespace-nowrap',
                    )}
                  >
                    New PR!
                  </p>
                  <p className="leading-tight">
                    {toDisplayWeight(prData?.estimated1RM || 10)?.toFixed(1)}{' '}
                    {preferences.weightUnit}
                  </p>
                </div>
                <div
                  className={cn(
                    'text-base font-medium flex items-center gap-1 text-green-600 dark:text-amber-300 whitespace-nowrap',
                    'text-base',
                  )}
                >
                  +{prData?.improvement.toFixed(1) || 3}%{' '}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
