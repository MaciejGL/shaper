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
      <title>Email</title>
    </head>
    <body style={{ margin: '0', padding: '0', backgroundColor: '#f6f9fc' }}>
      {previewText && (
        <div
          style={{
            display: 'none',
            fontSize: '1px',
            color: '#f6f9fc',
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
          backgroundColor: '#f6f9fc',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
        }}
      >
        <tr>
          <td align="center" style={{ padding: '40px 20px' }}>
            <table
              role="presentation"
              cellSpacing="0"
              cellPadding="0"
              border={0}
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
  logo?: string
  logoAlt?: string
  brandName?: string
  backgroundColor?: string
}

export const EmailHeader = ({
  logo,
  logoAlt = 'Logo',
  brandName = 'Fitspace',
  backgroundColor = '#1a1a1a',
}: EmailHeaderProps) => (
  <tr>
    <td
      style={{
        backgroundColor,
        padding: '32px',
        textAlign: 'center',
      }}
    >
      {logo ? (
        <div
          style={{
            margin: '0 auto',
          }}
        >
          <img
            src={'https://fit-space.app/favicons/android-chrome-192x192.png'}
            alt={logoAlt}
            style={{
              height: '40px',
              width: 'auto',
              display: 'block',
              margin: '0 16px 0 0',
            }}
          />
          <h1
            style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '500',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            {brandName}
          </h1>
        </div>
      ) : (
        <h1
          style={{
            margin: '0',
            fontSize: '24px',
            fontWeight: '500',
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}
        >
          {brandName}
        </h1>
      )}
    </td>
  </tr>
)

interface EmailContentProps {
  children: React.ReactNode
  padding?: string
}

export const EmailContent = ({
  children,
  padding = '40px',
}: EmailContentProps) => (
  <tr>
    <td style={{ padding }}>
      <div
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#374151',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
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
  companyName = 'Fitspace',
  address,
  unsubscribeUrl,
  socialLinks,
}: EmailFooterProps) => (
  <tr>
    <td
      style={{
        backgroundColor: '#ffffff',
        padding: '32px 40px',
        borderTop: '1px solid #e5e7eb',
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
            <td style={{ textAlign: 'center', paddingBottom: '20px' }}>
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  style={{
                    display: 'inline-block',
                    margin: '0 8px',
                    textDecoration: 'none',
                  }}
                >
                  {link.icon ? (
                    <img
                      src={link.icon || '/placeholder.svg'}
                      alt={link.name}
                      style={{ width: '24px', height: '24px' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        textDecoration: 'underline',
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
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.4',
              }}
            >
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
            {address && (
              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  color: '#9ca3af',
                  lineHeight: '1.4',
                }}
              >
                {address}
              </p>
            )}
            {unsubscribeUrl && (
              <a
                href={unsubscribeUrl}
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  textDecoration: 'underline',
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
}

export const EmailButton = ({
  href,
  children,
  backgroundColor = '#1f2937',
  textColor = '#ffffff',
  borderRadius = '6px',
  padding = '12px 24px',
}: EmailButtonProps) => (
  <table role="presentation" cellSpacing="0" cellPadding="0" border={0}>
    <tr>
      <td
        style={{
          borderRadius,
          backgroundColor,
        }}
      >
        <a
          href={href}
          style={{
            display: 'inline-block',
            padding,
            fontSize: '16px',
            fontWeight: '600',
            color: textColor,
            textDecoration: 'none',
            borderRadius,
          }}
        >
          {children}
        </a>
      </td>
    </tr>
  </table>
)

const fontSize = {
  1: '32px',
  2: '24px',
  3: '20px',
  4: '16px',
  5: '14px',
  6: '12px',
} as const

const fontWeight = {
  500: '500',
  400: '400',
} as const

const fontColor = {
  primary: '#374151',
  secondary: '#6b7280',
} as const

export const EmailHeading = ({
  children,
  size = 1,
  weight = 500,
  color = 'primary',
  center = false,
}: {
  children: React.ReactNode
  size?: keyof typeof fontSize
  weight?: keyof typeof fontWeight
  color?: keyof typeof fontColor
  center?: boolean
}) => {
  return (
    <h1
      style={{
        margin: '0 0 24px 0',
        fontSize: fontSize[size],
        fontWeight: fontWeight[weight],
        color: fontColor[color],
        textAlign: center ? 'center' : 'left',
      }}
    >
      {children}
    </h1>
  )
}

export const EmailText = ({
  children,
  color = 'primary',
  size = 4,
  center = false,
}: {
  children: React.ReactNode
  color?: keyof typeof fontColor
  size?: keyof typeof fontSize
  center?: boolean
}) => (
  <p
    style={{
      margin: '0 0 16px 0',
      fontSize: fontSize[size],
      color: fontColor[color],
      textAlign: center ? 'center' : 'left',
    }}
  >
    {children}
  </p>
)
