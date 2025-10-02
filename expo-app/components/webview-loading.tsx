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
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  const [displayProgress, setDisplayProgress] = React.useState(0)
  const [animationComplete, setAnimationComplete] = React.useState(false)

  // Linear progress animation: 0 to 100% in 500ms
  React.useEffect(() => {
    // Start the linear animation immediately
    Animated.timing(progressAnim, {
      toValue: 1, // 100%
      duration: 800, // 500ms animation duration
      useNativeDriver: true,
    }).start(() => {
      // Animation complete - stay at 100%
      setAnimationComplete(true)
    })
  }, [progressAnim])

  // Update display percentage
  React.useEffect(() => {
    const progressListener = progressAnim.addListener(({ value }) => {
      const percentage = Math.round(value * 100)
      setDisplayProgress(percentage)
    })

    return () => {
      progressAnim.removeListener(progressListener)
    }
  }, [progressAnim])

  // Optimized pulse animation for loading text
  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8, // Reduced range for subtler effect
          duration: 800, // Reduced duration for snappier feel
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800, // Reduced duration for snappier feel
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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Loading text with dots */}
      <View style={styles.loadingContainer}>
        <Animated.Text style={[styles.loadingText, { opacity: pulseAnim }]}>
          Loading workout
        </Animated.Text>
      </View>

      {/* Progress container */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
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
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
})
