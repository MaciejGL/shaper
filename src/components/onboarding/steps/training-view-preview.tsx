import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import Image from 'next/image'

import { GQLTrainingView } from '@/generated/graphql-client'

interface TrainingViewPreviewProps {
  trainingView: GQLTrainingView
}

export function TrainingViewPreview({
  trainingView,
}: TrainingViewPreviewProps) {
  const { theme } = useTheme()

  // Dynamically determine the image based on selection and theme
  const getImageSrc = () => {
    const view =
      trainingView === GQLTrainingView.Advanced ? 'advanced' : 'simple'
    const themeMode = theme === 'dark' ? 'dark' : 'light'
    return `/exercise/${view}-${themeMode}.png`
  }

  return (
    <div className="flex justify-center rounded-md">
      <AnimatePresence mode="wait">
        {trainingView === GQLTrainingView.Advanced ? (
          <motion.div
            key={'advanced'}
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
          >
            <Image
              src={getImageSrc()}
              alt={'Advanced View'}
              quality={100}
              width={358}
              height={364}
              priority
              unoptimized
              className="object-contain rounded-md"
            />
          </motion.div>
        ) : (
          <motion.div
            key={'simple'}
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
          >
            <Image
              src={getImageSrc()}
              alt={'Simple View'}
              quality={100}
              width={358}
              height={364}
              priority
              unoptimized
              className="object-contain rounded-md"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
