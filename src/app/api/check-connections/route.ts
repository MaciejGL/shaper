import { NextResponse } from 'next/server'

import { dbMonitor } from '@/lib/db-monitor'

// GET /api/check-connections - Get detailed connection information in a readable format
export async function GET() {
  try {
    console.info('🔍 Checking database connections via API...\n')

    // Get detailed connection information
    const details = await dbMonitor.getDetailedConnections()

    if (!details) {
      return NextResponse.json(
        { error: 'Failed to get connection details' },
        { status: 500 },
      )
    }

    // Format the same output as the CLI script
    const output: string[] = []

    output.push('=== DATABASE CONNECTION SUMMARY ===')
    output.push(`Total Connections: ${details.total_connections}`)

    output.push('\n📱 By Application:')
    Object.entries(details.connections_by_application)
      .sort(([, a], [, b]) => b - a)
      .forEach(([app, count]) => {
        output.push(`  ${app}: ${count}`)
      })

    output.push('\n👤 By User:')
    Object.entries(details.connections_by_user)
      .sort(([, a], [, b]) => b - a)
      .forEach(([user, count]) => {
        output.push(`  ${user}: ${count}`)
      })

    output.push('\n🔄 By State:')
    Object.entries(details.connections_by_state)
      .sort(([, a], [, b]) => b - a)
      .forEach(([state, count]) => {
        output.push(`  ${state}: ${count}`)
      })

    if (details.active_connections.length > 0) {
      output.push('\n⚡ Active Connections:')
      details.active_connections.forEach((conn) => {
        output.push(
          `  PID ${conn.pid}: ${conn.application_name} (${conn.usename}) - ${conn.connection_duration}`,
        )
        if (conn.query) {
          const shortQuery =
            conn.query.length > 100
              ? conn.query.substring(0, 100) + '...'
              : conn.query
          output.push(`    Query: ${shortQuery}`)
        }
      })
    }

    if (details.long_running_queries.length > 0) {
      output.push('\n🐌 Long-Running Queries:')
      details.long_running_queries.forEach((conn) => {
        output.push(
          `  PID ${conn.pid}: ${conn.application_name} - Running for ${conn.query_duration}`,
        )
        if (conn.query) {
          const shortQuery =
            conn.query.length > 100
              ? conn.query.substring(0, 100) + '...'
              : conn.query
          output.push(`    Query: ${shortQuery}`)
        }
      })
    }

    output.push('===================================')

    // Additional insights
    const insights: string[] = []

    // Most active applications
    const topApps = Object.entries(details.connections_by_application)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topApps.length > 0) {
      insights.push('\n📊 INSIGHTS:')
      insights.push('Most active applications:')
      topApps.forEach(([app, count]) => {
        insights.push(`  • ${app}: ${count} connections`)
      })
    }

    // Connection health
    const idleCount = details.idle_connections.length
    const activeCount = details.active_connections.length
    const totalCount = details.total_connections

    insights.push(`\nConnection health:`)
    insights.push(
      `  • Active: ${activeCount}/${totalCount} (${Math.round((activeCount / totalCount) * 100)}%)`,
    )
    insights.push(
      `  • Idle: ${idleCount}/${totalCount} (${Math.round((idleCount / totalCount) * 100)}%)`,
    )

    // Warnings
    const warnings: string[] = []
    if (details.long_running_queries.length > 0) {
      warnings.push(
        `⚠️  Warning: ${details.long_running_queries.length} long-running queries detected`,
      )
    }

    if (totalCount > 8) {
      warnings.push(
        `⚠️  Warning: High connection count (${totalCount}). Consider connection pooling.`,
      )
    }

    // Return both formatted text and structured data
    return NextResponse.json({
      summary: output.join('\n'),
      insights: insights.join('\n'),
      warnings,
      raw_data: details,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error checking connections via API:', error)
    return NextResponse.json(
      { error: 'Failed to check connections', details: error },
      { status: 500 },
    )
  }
}
