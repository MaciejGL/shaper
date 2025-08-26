import * as React from 'react'

interface EmailWrapperProps {
  children: React.ReactNode
  previewText?: string
}

export const EmailWrapper = ({ children, previewText }: EmailWrapperProps) => (
  <html>
    {/* eslint-disable-next-line */}
    <head>
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Hypertro</title>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        `}
      </style>
    </head>
    <body
      style={{
        margin: '0',
        padding: '0',
        backgroundColor: '#f8fafc',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
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
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        }}
      >
        <tr>
          <td align="center" style={{ padding: '48px 24px' }}>
            <table
              role="presentation"
              cellSpacing="0"
              cellPadding="0"
              border={0}
              style={{
                maxWidth: '580px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
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
  logoAlt?: string
  brandName?: string
  backgroundColor?: string
}

export const EmailHeader = ({
  logoAlt = 'Hypertro',
  brandName = 'Hypertro',
  backgroundColor = '#0f172a',
}: EmailHeaderProps) => (
  <tr>
    <td
      style={{
        backgroundColor,
        padding: '40px 48px',
        textAlign: 'center',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={'https://hypertro.app/favicons/android-chrome-192x192.png'}
          alt={logoAlt}
          style={{
            height: '32px',
            width: '32px',
            marginRight: '12px',
          }}
        />
        <h1
          style={{
            margin: '0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.025em',
            lineHeight: '1.2',
          }}
        >
          {brandName}
        </h1>
      </div>
    </td>
  </tr>
)

interface EmailContentProps {
  children: React.ReactNode
  padding?: string
}

export const EmailContent = ({
  children,
  padding = '48px',
}: EmailContentProps) => (
  <tr>
    <td style={{ padding }}>
      <div
        style={{
          fontSize: '16px',
          lineHeight: '1.7',
          color: '#334155',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
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
  socialLinks?: {
    name: string
    url: string
    icon?: string
  }[]
}

export const EmailFooter = ({
  companyName = 'Hypertro',
  address,
  unsubscribeUrl,
  socialLinks,
}: EmailFooterProps) => (
  <tr>
    <td
      style={{
        backgroundColor: '#f8fafc',
        padding: '32px 48px',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <table
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
        style={{ width: '100%' }}
      >
        {socialLinks && socialLinks.length > 0 && (
          <tr>
            <td style={{ textAlign: 'center', paddingBottom: '24px' }}>
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  style={{
                    display: 'inline-block',
                    margin: '0 12px',
                    textDecoration: 'none',
                  }}
                >
                  {link.icon ? (
                    <img
                      src={link.icon || '/placeholder.svg'}
                      alt={link.name}
                      style={{ width: '20px', height: '20px' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        textDecoration: 'underline',
                        fontWeight: '500',
                      }}
                    >
                      {link.name}
                    </span>
                  )}
                </a>
              ))}
            </td>
          </tr>
        )}
        <tr>
          <td style={{ textAlign: 'center' }}>
            <p
              style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                color: '#64748b',
                lineHeight: '1.5',
                fontWeight: '500',
              }}
            >
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
            {address && (
              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: '#94a3b8',
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
                  color: '#64748b',
                  textDecoration: 'underline',
                  fontWeight: '500',
                }}
              >
                Unsubscribe
              </a>
            )}
          </td>
        </tr>
      </table>
    </td>
  </tr>
)

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  backgroundColor?: string
  textColor?: string
  borderRadius?: string
  padding?: string
  size?: 'sm' | 'md' | 'lg'
}

export const EmailButton = ({
  href,
  children,
  backgroundColor = '#0f172a',
  textColor = '#ffffff',
  borderRadius = '8px',
  padding,
  size = 'md',
}: EmailButtonProps) => {
  const defaultPadding = {
    sm: '10px 20px',
    md: '14px 28px',
    lg: '16px 32px',
  }[size]

  const fontSize = {
    sm: '14px',
    md: '16px',
    lg: '16px',
  }[size]

  return (
    <table
      role="presentation"
      cellSpacing="0"
      cellPadding="0"
      border={0}
      style={{ margin: '0 auto' }}
    >
      <tr>
        <td
          style={{
            borderRadius,
            backgroundColor,
            border: '1px solid transparent',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <a
            href={href}
            style={{
              display: 'inline-block',
              padding: padding || defaultPadding,
              fontSize,
              fontWeight: '600',
              color: textColor,
              textDecoration: 'none',
              borderRadius,
              lineHeight: '1.4',
              letterSpacing: '-0.025em',
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  )
}

const fontSize = {
  1: '28px',
  2: '24px',
  3: '20px',
  4: '16px',
  5: '14px',
  6: '12px',
} as const

const fontWeight = {
  300: '300',
  400: '400',
  500: '500',
  600: '600',
  700: '700',
} as const

const fontColor = {
  primary: '#0f172a',
  secondary: '#475569',
  muted: '#64748b',
  subtle: '#94a3b8',
} as const

export const EmailHeading = ({
  children,
  size = 1,
  weight = 600,
  color = 'primary',
  center = false,
  marginBottom = '24px',
}: {
  children: React.ReactNode
  size?: keyof typeof fontSize
  weight?: keyof typeof fontWeight
  color?: keyof typeof fontColor
  center?: boolean
  marginBottom?: string
}) => {
  return (
    <h1
      style={{
        margin: `0 0 ${marginBottom} 0`,
        fontSize: fontSize[size],
        fontWeight: fontWeight[weight],
        color: fontColor[color],
        textAlign: center ? 'center' : 'left',
        lineHeight: '1.3',
        letterSpacing: '-0.025em',
      }}
    >
      {children}
    </h1>
  )
}

export const EmailText = ({
  children,
  color = 'secondary',
  size = 4,
  weight = 400,
  center = false,
  marginBottom = '20px',
}: {
  children: React.ReactNode
  color?: keyof typeof fontColor
  size?: keyof typeof fontSize
  weight?: keyof typeof fontWeight
  center?: boolean
  marginBottom?: string
}) => (
  <p
    style={{
      margin: `0 0 ${marginBottom} 0`,
      fontSize: fontSize[size],
      fontWeight: fontWeight[weight],
      color: fontColor[color],
      textAlign: center ? 'center' : 'left',
      lineHeight: '1.6',
    }}
  >
    {children}
  </p>
)

// Additional utility components for modern email design
export const EmailDivider = () => (
  <div
    style={{
      height: '1px',
      backgroundColor: '#e2e8f0',
      margin: '32px 0',
    }}
  />
)

export const EmailCard = ({
  children,
  backgroundColor = '#f8fafc',
  borderColor = '#e2e8f0',
  padding = '24px',
}: {
  children: React.ReactNode
  backgroundColor?: string
  borderColor?: string
  padding?: string
}) => (
  <div
    style={{
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      padding,
      margin: '24px 0',
    }}
  >
    {children}
  </div>
)

export const EmailAlert = ({
  children,
  type = 'info',
}: {
  children: React.ReactNode
  type?: 'info' | 'warning' | 'error' | 'success'
}) => {
  const alertStyles = {
    info: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af' },
    warning: { bg: '#fefce8', border: '#fde047', text: '#a16207' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  }[type]

  return (
    <div
      style={{
        backgroundColor: alertStyles.bg,
        border: `1px solid ${alertStyles.border}`,
        borderRadius: '8px',
        padding: '16px',
        margin: '24px 0',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: alertStyles.text,
          lineHeight: '1.5',
        }}
      >
        {children}
      </div>
    </div>
  )
}
