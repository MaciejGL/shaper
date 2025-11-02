import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { PDF_STYLES } from '../pdf-generator'

interface PDFPageLayoutProps {
  children: ReactNode
  footer?: ReactNode
}

/**
 * Standard page layout with consistent styling
 * Provides padding and structure for PDF pages
 */
export function PDFPageLayout({ children, footer }: PDFPageLayoutProps) {
  return (
    <View style={styles.page}>
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  )
}

interface PDFFooterProps {
  metadata?: string
  showLogo?: boolean
}

/**
 * Standard footer with Hypro branding
 * @param metadata - Additional text to display (e.g., "Prepared by Trainer Name")
 * @param showLogo - Whether to show the logo (default: true)
 */
export function PDFFooter({ metadata, showLogo = true }: PDFFooterProps) {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerDivider} />
      <View style={styles.footerContent}>
        {showLogo && (
          <View style={styles.footerBrand}>
            <PDFLogo size={16} />
            <Text style={styles.footerBrandText}>Hypro</Text>
          </View>
        )}
        {metadata && <Text style={styles.footerMetadata}>{metadata}</Text>}
      </View>
    </View>
  )
}

interface PDFLogoProps {
  size?: number
}

/**
 * Hypro logo for PDF documents
 * Uses the actual PNG logo from public folder
 */
export function PDFLogo({ size = 32 }: PDFLogoProps) {
  return (
    <Image
      src="/favicons/android-chrome-192x192.png"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  )
}

interface PDFHeaderProps {
  title: string
  subtitle?: string
}

/**
 * Standard page header
 */
export function PDFHeader({ title, subtitle }: PDFHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  )
}

interface PDFSectionProps {
  title?: string
  children: ReactNode
}

/**
 * Content section with optional title
 */
export function PDFSection({ title, children }: PDFSectionProps) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: PDF_STYLES.page.padding,
    fontFamily: 'Inter',
    fontSize: PDF_STYLES.fonts.base,
    color: PDF_STYLES.colors.text,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: PDF_STYLES.spacing.xl,
  },
  footerContainer: {
    paddingTop: PDF_STYLES.spacing.md,
  },
  footerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_STYLES.colors.border,
    marginBottom: PDF_STYLES.spacing.md,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PDF_STYLES.spacing.sm,
  },
  footerBrandText: {
    fontSize: PDF_STYLES.fonts.medium,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: PDF_STYLES.colors.text,
  },
  footerMetadata: {
    fontSize: PDF_STYLES.fonts.small,
    color: PDF_STYLES.colors.muted,
  },
  header: {
    marginBottom: PDF_STYLES.spacing.xl,
  },
  headerTitle: {
    fontSize: PDF_STYLES.fonts.xxlarge,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: PDF_STYLES.colors.text,
    marginBottom: PDF_STYLES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: PDF_STYLES.fonts.medium,
    color: PDF_STYLES.colors.muted,
  },
  section: {
    marginBottom: PDF_STYLES.spacing.lg,
  },
  sectionTitle: {
    fontSize: PDF_STYLES.fonts.large,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: PDF_STYLES.colors.text,
    marginBottom: PDF_STYLES.spacing.md,
  },
})
