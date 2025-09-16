/**
 * Enhanced WebView Loading Component
 * Professional loading experience with smart progress handling
 */
import React from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

interface WebViewLoadingProps {
  progress?: number // 0 to 1
}

export function WebViewLoading({ progress = 0 }: WebViewLoadingProps) {
  const progressAnim = React.useRef(new Animated.Value(0)).current
  const smoothProgressAnim = React.useRef(new Animated.Value(0)).current
  const shimmerAnim = React.useRef(new Animated.Value(0)).current
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  const [displayProgress, setDisplayProgress] = React.useState(0)
  const [isStuck, setIsStuck] = React.useState(false)
  const [useSmoothing, setUseSmoothing] = React.useState(false)
  const progressRef = React.useRef(0)
  const stuckTimeoutRef = React.useRef<number | null>(null)

  // Enhanced progress animation with stuck detection
  React.useEffect(() => {
    const targetProgress = Math.max(progress, 0.1) // Minimum 10% to show activity

    // Clear existing stuck timeout
    if (stuckTimeoutRef.current) {
      clearTimeout(stuckTimeoutRef.current)
    }

    // Always prioritize actual WebView progress
    if (progress !== progressRef.current) {
      // Progress is updating - disable smoothing and follow WebView
      setIsStuck(false)
      setUseSmoothing(false)
      progressRef.current = progress

      // Animate to actual progress with smooth transition
      Animated.timing(progressAnim, {
        toValue: targetProgress,
        duration: 300,
        useNativeDriver: false,
      }).start()

      // Reset smooth animation to current progress
      smoothProgressAnim.setValue(targetProgress)
    } else if (progress > 0 && progress < 1) {
      // Progress hasn't changed - start stuck detection
      stuckTimeoutRef.current = setTimeout(() => {
        setIsStuck(true)
        setUseSmoothing(true)
      }, 1500)
    }
  }, [progress, progressAnim, smoothProgressAnim])

  // Smooth fallback animation for better UX when stuck
  React.useEffect(() => {
    if (useSmoothing && progress < 1) {
      // Continue smooth animation from current progress to 85%
      const currentProgress = Math.max(progress, 0.1)
      const targetProgress = Math.min(currentProgress + 0.15, 0.85)

      Animated.timing(smoothProgressAnim, {
        toValue: targetProgress,
        duration: 2000,
        useNativeDriver: false,
      }).start()
    }
  }, [useSmoothing, smoothProgressAnim, progress])

  // Update display percentage with smooth interpolation
  React.useEffect(() => {
    let currentProgressValue = 0
    let currentSmoothValue = 0

    const progressListener = progressAnim.addListener(({ value }) => {
      currentProgressValue = value
    })

    const smoothListener = smoothProgressAnim.addListener(({ value }) => {
      currentSmoothValue = value
    })

    const updateProgress = () => {
      // Always prioritize actual WebView progress over smooth animation
      const currentProgress =
        useSmoothing && currentSmoothValue > currentProgressValue
          ? currentSmoothValue // Only use smooth when it's ahead and we're stuck
          : currentProgressValue // Otherwise, always follow actual progress

      // Show 100% when actually complete, otherwise cap at 99%
      const smoothedProgress =
        progress >= 1 ? 100 : Math.min(currentProgress * 100, 99)

      setDisplayProgress(Math.round(smoothedProgress))
    }

    // Update more frequently for smoother animation
    const interval = setInterval(updateProgress, 50)
    updateProgress() // Initial update

    return () => {
      clearInterval(interval)
      progressAnim.removeListener(progressListener)
      smoothProgressAnim.removeListener(smoothListener)
    }
  }, [useSmoothing, progressAnim, smoothProgressAnim, progress])

  // Clean up timeout when component unmounts
  React.useEffect(() => {
    return () => {
      if (stuckTimeoutRef.current) {
        clearTimeout(stuckTimeoutRef.current)
      }
    }
  }, [])

  // Shimmer animation for when progress is stuck
  React.useEffect(() => {
    if (isStuck) {
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      )
      shimmerLoop.start()
      return () => shimmerLoop.stop()
    }
  }, [isStuck, shimmerAnim])

  // Pulse animation for loading text
  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    pulseLoop.start()
    return () => pulseLoop.stop()
  }, [pulseAnim])

  // Fade in animation
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300],
  })

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Loading text with dots */}
      <View style={styles.loadingContainer}>
        <Animated.Text style={[styles.loadingText, { opacity: pulseAnim }]}>
          Loading workout
        </Animated.Text>

        {/* Loading dots aligned with text */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0.7, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0.7, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Progress container */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: useSmoothing
                  ? smoothProgressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  : progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
              },
            ]}
          >
            {/* Shimmer effect when stuck */}
            {isStuck && (
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslateX }],
                  },
                ]}
              />
            )}
          </Animated.View>
        </View>
      </View>

      {/* Progress percentage below progress bar */}
      <Text style={styles.progressText}>{displayProgress}%</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 40,
    zIndex: 1000,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 48,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 12,
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
    position: 'relative',
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 100,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginHorizontal: 4,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
})
