import type { Booking } from './types'

export async function sendBookingConfirmationEmail(booking: Booking) {
  const isSimulation = !process.env.RESEND_API_KEY

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const trackLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track-order?code=${booking.bookingCode}`

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi Pemesanan Airlangga Travel</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FFFDF5;
          color: #1A1A1A;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 30px 20px;
          background-color: #1A1A1A;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        .header h1 {
          color: #F4B400;
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
          font-weight: 700;
        }
        .header p {
          color: #FFFDF5;
          margin: 5px 0 0 0;
          font-size: 14px;
          opacity: 0.8;
        }
        .content {
          background-color: #FFFFFF;
          padding: 30px 25px;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          border: 1px solid #E5E5E5;
          border-top: none;
        }
        .greeting {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 25px;
        }
        .booking-card {
          background-color: #FFFDF5;
          border: 1px solid #FFE066;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .booking-code-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #6B6B6B;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .booking-code {
          font-size: 20px;
          font-family: monospace;
          font-weight: bold;
          color: #D4A017;
          margin-top: 2px;
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #E5E5E5;
          font-size: 14px;
        }
        .info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .info-label {
          color: #6B6B6B;
        }
        .info-value {
          font-weight: 600;
          text-align: right;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0 0 0;
          margin-top: 15px;
          border-top: 2px dashed #E5E5E5;
          font-size: 16px;
        }
        .price-label {
          font-weight: 700;
        }
        .price-value {
          font-weight: 800;
          color: #F4B400;
          font-size: 18px;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          background-color: #F4B400;
          color: #FFFFFF !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 14px;
          display: inline-block;
          box-shadow: 0 4px 6px rgba(244, 180, 0, 0.2);
          transition: background-color 0.2s;
        }
        .instructions {
          font-size: 13px;
          color: #6B6B6B;
          line-height: 1.5;
          padding: 15px;
          background-color: #F9F9F9;
          border-radius: 8px;
          margin-top: 25px;
        }
        .footer {
          text-align: center;
          padding: 25px 20px;
          font-size: 12px;
          color: #6B6B6B;
          line-height: 1.5;
        }
        .footer a {
          color: #F4B400;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AIRLANGGA TRAVEL</h1>
          <p>Eksplorasi Dunia dengan Kenyamanan Utama</p>
        </div>
        <div class="content">
          <div class="greeting">
            Halo <strong>${booking.customerName}</strong>,<br><br>
            Terima kasih telah memesan perjalanan bersama kami. Pemesanan Anda telah berhasil dibuat dengan status <strong>${booking.status === 'paid' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}</strong>. Berikut adalah rincian reservasi Anda:
          </div>

          <div class="booking-card">
            <div class="booking-code-label">KODE BOOKING</div>
            <div class="booking-code">${booking.bookingCode}</div>
            
            <div class="info-row">
              <span class="info-label">Paket Perjalanan</span>
              <span class="info-value">${booking.tripTitle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tanggal Keberangkatan</span>
              <span class="info-value">${booking.departureDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Jumlah Peserta</span>
              <span class="info-value">${booking.participants} Orang</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${booking.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No. WhatsApp</span>
              <span class="info-value">${booking.whatsapp}</span>
            </div>

            <div class="price-row">
              <span class="price-label">Total Pembayaran</span>
              <span class="price-value">${formatPrice(booking.totalPrice)}</span>
            </div>
          </div>

          <div class="btn-container">
            <a href="${trackLink}" class="btn" target="_blank">Lacak Status Pesanan</a>
          </div>

          ${booking.status === 'pending' ? `
            <div class="instructions">
              <strong>Petunjuk Pembayaran:</strong><br>
              1. Klik tombol "Lacak Status Pesanan" di atas.<br>
              2. Selesaikan pembayaran menggunakan payment gateway Midtrans Snap sebelum batas waktu.<br>
              3. Batas waktu pembayaran: <strong>${new Date(booking.paymentDeadline).toLocaleString('id-ID')}</strong>.<br>
              4. Jika pembayaran tidak diselesaikan sebelum batas waktu, pemesanan akan dibatalkan secara otomatis.
            </div>
          ` : `
            <div class="instructions">
              <strong>Langkah Selanjutnya:</strong><br>
              Pemesanan Anda telah lunas. Tim Customer Service kami akan segera menghubungi Anda melalui nomor WhatsApp <strong>${booking.whatsapp}</strong> untuk memberikan informasi teknis dan perlengkapan perjalanan yang perlu dipersiapkan.
            </div>
          `}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Airlangga Travel. All rights reserved.<br>
          Butuh bantuan? Hubungi <a href="https://wa.me/6208111211143">WhatsApp Customer Service</a> kami.
        </div>
      </div>
    </body>
    </html>
  `

  if (isSimulation) {
    console.log(`
==================================================
[SIMULATION] EMAIL SENT SUCCESSFULLY
To: ${booking.email}
Subject: Konfirmasi Pemesanan - ${booking.bookingCode}
--------------------------------------------------
Link Lacak: ${trackLink}
Detail Booking:
  - Pelanggan: ${booking.customerName}
  - Paket: ${booking.tripTitle}
  - Total: ${formatPrice(booking.totalPrice)}
  - Status: ${booking.status}
  - Batas Bayar: ${booking.paymentDeadline}
==================================================
`)
    return { success: true, simulated: true }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Airlangga Travel <onboarding@resend.dev>', // resend testing domain
        to: [booking.email],
        subject: `[Airlangga Travel] Konfirmasi Booking ${booking.bookingCode}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to send email via Resend API:', errorData)
      return { success: false, error: errorData }
    }

    const data = await response.json()
    console.log('Email sent successfully via Resend API:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error occurred while sending email:', error)
    return { success: false, error }
  }
}
