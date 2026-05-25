import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || ''

// Use MIDTRANS_IS_SANDBOX env var, fallback to key prefix detection
const IS_SANDBOX = process.env.MIDTRANS_IS_SANDBOX === 'true' || MIDTRANS_SERVER_KEY.startsWith('SB-')
const IS_PRODUCTION = !IS_SANDBOX

const MIDTRANS_API_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      orderId,
      grossAmount,
      customerName,
      email,
      phone,
      tripTitle,
      participants,
    } = body

    // Validate required fields
    if (!orderId || !grossAmount || !customerName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create unique order ID for Midtrans to avoid duplicate order ID errors (allows payment re-attempts)
    const uniqueOrderId = `${orderId}-${Date.now()}`

    // Create Midtrans transaction payload
    const transactionDetails = {
      order_id: uniqueOrderId,
      gross_amount: grossAmount,
    }

    const customerDetails = {
      first_name: customerName,
      email: email,
      phone: phone || '',
    }

    const itemDetails = [
      {
        id: uniqueOrderId,
        price: Math.round(grossAmount / (participants || 1)),
        quantity: participants || 1,
        name: (tripTitle || 'Pemesanan Travel').substring(0, 50), // Midtrans limits item name to 50 chars
      },
    ]

    const payload = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
      credit_card: {
        secure: true,
      },
    }

    // Encode server key for authorization
    const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')

    // Make request to Midtrans Snap API
    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Midtrans API error:', data)
      return NextResponse.json(
        { error: data.error_messages?.[0] || 'Failed to create transaction' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      token: data.token,
      redirectUrl: data.redirect_url,
      clientKey: MIDTRANS_CLIENT_KEY,
    })
  } catch (error) {
    console.error('Midtrans transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Webhook handler for payment notifications
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body

    // Verify signature
    const serverKey = MIDTRANS_SERVER_KEY
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Determine payment status
    let paymentStatus: 'pending' | 'dp_paid' | 'paid' | 'cancelled' = 'pending'

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        paymentStatus = 'paid'
      }
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'cancelled'
    }

    // Update database with payment status
    const parts = order_id.split('-')
    const bookingCode = parts.slice(0, parts.length - 1).join('-')

    if (process.env.DATABASE_URL && (paymentStatus === 'paid' || paymentStatus === 'cancelled')) {
      try {
        const booking = await prisma.booking.findUnique({
          where: { bookingCode },
          include: { trip: true },
        })

        if (booking) {
          let resolvedStatus: 'pending' | 'dp_paid' | 'paid' | 'cancelled' = paymentStatus
          if (paymentStatus === 'paid') {
            const depositPercentage = booking.trip?.depositPercentage ?? 100
            if (depositPercentage < 100) {
              resolvedStatus = 'dp_paid'
            }
          }

          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: resolvedStatus },
          })
          
          paymentStatus = resolvedStatus
        }
      } catch (dbError) {
        console.error('Error updating booking status from webhook:', dbError)
      }
    }

    return NextResponse.json({
      orderId: order_id,
      status: paymentStatus,
      transactionStatus: transaction_status,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
