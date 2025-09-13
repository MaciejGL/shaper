/**
 * WebView Loading Component with Progress Bar
 * Simple progress bar on black background during WebView loading
 */
import React from 'react'
import { Animated, StyleSheet, View } from 'react-native'

interface WebViewLoadingProps {
  progress?: number // 0 to 1
}

export function WebViewLoading({ progress = 0 }: WebViewLoadingProps) {
  const progressAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [progress, progressAnim])

  return (
    <View style={styles.container}>
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
    </View>
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
    backgroundColor: '#000000', // Black background
    paddingHorizontal: 40,
    zIndex: 1000,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
  },
  progressBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#333333', // Dark gray background
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b', // Amber progress fill
    borderRadius: 2,
  },
})
