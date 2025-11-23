import * as React from 'react'

// Updated Design Tokens for Minimalist System
const theme = {
  colors: {
    background: '#ffffff',
    text: '#1a1a1a', // Almost black
    muted: '#6b7280', // Gray 500
    border: '#e5e7eb', // Gray 200
    primary: '#18181b', // Zinc 900
    link: '#1a1a1a', // Keep links neutral for minimalism
    headerBg: '#000000', // Black header
    headerText: '#ffffff',
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  spacing: {
    s: '12px',
    m: '24px',
    l: '32px',
  },
}

interface EmailWrapperProps {
  children: React.ReactNode
  previewText?: string
}

export const EmailWrapper = ({ children, previewText }: EmailWrapperProps) => (
  <html>
    <head>
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Hypro</title>
    </head>
    <body
      style={{
        margin: '0',
        padding: '0',
        backgroundColor: '#f8fafc', // Light gray background for the email client view
        fontFamily: theme.fonts.sans,
        color: theme.colors.text,
        lineHeight: '1.5',
      }}
    >
      {previewText && (
        <div
          style={{
            display: 'none',
            fontSize: '1px',
            color: '#f8fafc',
            lineHeight: '1px',
            maxHeight: '0px',
            maxWidth: '0px',
            opacity: 0,
            overflow: 'hidden',
          }}
        >
          {previewText}
        </div>
      )}
      <table
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
        style={{
          width: '100%',
          backgroundColor: '#f8fafc',
          fontFamily: theme.fonts.sans,
        }}
      >
        <tr>
          <td align="center" style={{ padding: '40px 0' }}>
            <table
              role="presentation"
              cellSpacing="0"
              cellPadding="0"
              border={0}
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: theme.colors.background,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow:
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              {children}
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
)

interface EmailHeaderProps {
  brandName?: string
}

export const EmailHeader = ({ brandName = 'Hypro' }: EmailHeaderProps) => (
  <tr>
    <td
      style={{
        backgroundColor: theme.colors.headerBg,
        padding: '32px 40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <img
          src="https://www.hypro.app/favicons/android-chrome-192x192.png"
          alt="Hypro Logo"
          width="32"
          height="32"
          style={{
            display: 'block',
            width: '32px',
            height: '32px',
            borderRadius: '50%', // Ensure rounded logo
          }}
        />
        <span
          style={{
            fontSize: '24px',
            fontWeight: '500',
            color: theme.colors.headerText,
          }}
        >
          {brandName}
        </span>
      </div>
    </td>
  </tr>
)

interface EmailContentProps {
  children: React.ReactNode
}

export const EmailContent = ({ children }: EmailContentProps) => (
  <tr>
    <td style={{ padding: '40px' }}>
      <div
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: theme.colors.text,
        }}
      >
        {children}
      </div>
    </td>
  </tr>
)

interface EmailFooterProps {
  companyName?: string
  address?: string
  unsubscribeUrl?: string
}

export const EmailFooter = ({
  companyName = 'Hypro',
  address,
  unsubscribeUrl,
}: EmailFooterProps) => (
  <tr>
    <td
      style={{
        padding: '32px 40px',
        backgroundColor: '#f8fafc',
        borderTop: `1px solid ${theme.colors.border}`,
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.primary,
          }}
        >
          Questions?
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '14px',
            color: theme.colors.muted,
          }}
        >
          Contact us at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: theme.colors.primary, textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
        </p>
      </div>

      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '13px',
          color: theme.colors.muted,
          lineHeight: '1.5',
        }}
      >
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </p>
      {address && (
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: theme.colors.muted,
            lineHeight: '1.5',
          }}
        >
          {address}
        </p>
      )}
      {unsubscribeUrl && (
        <a
          href={unsubscribeUrl}
          style={{
            fontSize: '13px',
            color: theme.colors.muted,
            textDecoration: 'underline',
          }}
        >
          Unsubscribe
        </a>
      )}
    </td>
  </tr>
)

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  fullWidth?: boolean
}

export const EmailButton = ({
  href,
  children,
  fullWidth,
}: EmailButtonProps) => (
  <table
    role="presentation"
    cellSpacing="0"
    cellPadding="0"
    border={0}
    style={{ width: fullWidth ? '100%' : 'auto', margin: '32px auto' }} // Centered by default
  >
    <tr>
      <td
        style={{
          borderRadius: '8px',
          backgroundColor: theme.colors.primary,
          textAlign: 'center',
        }}
      >
        <a
          href={href}
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            width: fullWidth ? '100%' : 'auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </a>
      </td>
    </tr>
  </table>
)

export const EmailHeading = ({
  children,
  as = 'h1',
}: {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
}) => {
  const styles = {
    h1: {
      fontSize: '28px',
      fontWeight: '500',
      margin: '0 0 24px 0',
      letterSpacing: '-0.75px',
      color: theme.colors.primary,
    },
    h2: {
      fontSize: '22px',
      fontWeight: '500',
      margin: '32px 0 16px 0',
      letterSpacing: '-0.5px',
      color: theme.colors.primary,
    },
    h3: {
      fontSize: '18px',
      fontWeight: '500',
      margin: '24px 0 12px 0',
      color: theme.colors.primary,
    },
  }[as]

  return <div style={{ ...styles }}>{children}</div>
}

export const EmailText = ({
  children,
  color = 'text',
  size = '16px',
  weight = '400',
  style = {},
}: {
  children: React.ReactNode
  color?: keyof typeof theme.colors
  size?: string
  weight?: string
  style?: React.CSSProperties
}) => (
  <p
    style={{
      margin: '0 0 24px 0',
      fontSize: size,
      fontWeight: weight,
      color: theme.colors[color] || color,
      lineHeight: '1.6',
      ...style,
    }}
  >
    {children}
  </p>
)

export const EmailDivider = () => (
  <div
    style={{
      height: '1px',
      backgroundColor: theme.colors.border,
      margin: '32px 0',
    }}
  />
)

// Minimalist "Callout" or "Card" - just a bordered box
export const EmailCard = ({
  children,
  padding = '24px',
  backgroundColor = '#ffffff',
}: {
  children: React.ReactNode
  padding?: string
  backgroundColor?: string
}) => (
  <div
    style={{
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px', // More rounded
      padding,
      marginBottom: '24px',
      backgroundColor: backgroundColor,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', // Subtle shadow
    }}
  >
    {children}
  </div>
)

// Simple text-based alert
export const EmailAlert = ({
  children,
  type = 'info',
}: {
  children: React.ReactNode
  type?: 'info' | 'warning' | 'error' | 'success'
}) => {
  const styles = {
    info: { bg: '#f8fafc', text: theme.colors.text },
    warning: { bg: '#fffbeb', text: '#92400e' },
    error: { bg: '#fef2f2', text: '#b91c1c' },
    success: { bg: '#f0fdf4', text: '#15803d' },
  }[type]

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        fontSize: '14px',
        color: styles.text,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {children}
    </div>
  )
}

export const EmailLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    style={{
      color: theme.colors.primary,
      textDecoration: 'underline',
      textDecorationColor: theme.colors.border,
      textUnderlineOffset: '4px',
      fontWeight: '500',
    }}
  >
    {children}
  </a>
)
