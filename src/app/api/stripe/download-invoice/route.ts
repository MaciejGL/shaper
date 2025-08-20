import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const invoiceId = searchParams.get('invoiceId')

    if (!userId || !invoiceId) {
      return NextResponse.json(
        { error: 'User ID and Invoice ID are required' },
        { status: 400 },
      )
    }

    // Verify the user owns this invoice
    const billingRecord = await prisma.billingRecord.findFirst({
      where: {
        stripeInvoiceId: invoiceId,
        subscription: {
          userId,
        },
      },
      include: {
        subscription: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!billingRecord) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 },
      )
    }

    // Get the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId)

    if (!invoice.invoice_pdf) {
      return NextResponse.json(
        { error: 'Invoice PDF not available' },
        { status: 404 },
      )
    }

    // Fetch the PDF from Stripe
    const pdfResponse = await fetch(invoice.invoice_pdf)

    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch invoice PDF' },
        { status: 500 },
      )
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading invoice:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to download invoice' },
      { status: 500 },
    )
  }
}
