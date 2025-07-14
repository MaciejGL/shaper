#!/usr/bin/env ts-node
import { prisma } from '@/lib/db'
import { dbMonitor } from '@/lib/db-monitor'

async function checkConnections() {
  console.info('🔍 Checking database connections...\n')

  try {
    // Get detailed connection information
    await dbMonitor.logConnectionSummary()

    // Also show some additional insights
    const details = await dbMonitor.getDetailedConnections()

    if (details) {
      console.info('\n📊 INSIGHTS:')

      // Most active applications
      const topApps = Object.entries(details.connections_by_application)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

      if (topApps.length > 0) {
        console.info('Most active applications:')
        topApps.forEach(([app, count]) => {
          console.info(`  • ${app}: ${count} connections`)
        })
      }

      // Connection health
      const idleCount = details.idle_connections.length
      const activeCount = details.active_connections.length
      const totalCount = details.total_connections

      console.info(`\nConnection health:`)
      console.info(
        `  • Active: ${activeCount}/${totalCount} (${Math.round((activeCount / totalCount) * 100)}%)`,
      )
      console.info(
        `  • Idle: ${idleCount}/${totalCount} (${Math.round((idleCount / totalCount) * 100)}%)`,
      )

      // Warnings
      if (details.long_running_queries.length > 0) {
        console.info(
          `\n⚠️  Warning: ${details.long_running_queries.length} long-running queries detected`,
        )
      }

      if (totalCount > 8) {
        console.info(
          `\n⚠️  Warning: High connection count (${totalCount}). Consider connection pooling.`,
        )
      }

      // Individual connection details
      if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
        console.info('\n📋 ALL CONNECTIONS:')
        details.all_connections.forEach((conn) => {
          console.info(`\n  PID ${conn.pid}:`)
          console.info(`    User: ${conn.usename}`)
          console.info(`    Application: ${conn.application_name}`)
          console.info(`    Client: ${conn.client_addr || 'localhost'}`)
          console.info(`    Connected: ${conn.connection_duration}`)
          console.info(`    State: ${conn.state}`)
          if (conn.query) {
            const shortQuery =
              conn.query.length > 150
                ? conn.query.substring(0, 150) + '...'
                : conn.query
            console.info(`    Query: ${shortQuery}`)
          }
        })
      }
    }
  } catch (error) {
    console.error('❌ Error checking connections:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkConnections().catch(console.error)
