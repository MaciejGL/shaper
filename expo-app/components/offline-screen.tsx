/**
 * Custom Offline Screen Component
 * Shows when user has no network connection
 */
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface OfflineScreenProps {
  onRetry: () => void
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  return (
    <View style={styles.container}>
      {/* WiFi off icon */}
      <View style={styles.iconContainer}>
        <MaterialIcons name="wifi-off" size={80} color="#64748b" />
      </View>

      {/* Title and message */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.message}>
          Check your connection and try again. Make sure WiFi or mobile data is
          turned on.
        </Text>
      </View>

      {/* Retry button */}
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <MaterialIcons name="refresh" size={24} color="#ffffff" />
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>

      {/* Help text */}
      <Text style={styles.helpText}>
        Pull down to refresh when connection is restored
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
