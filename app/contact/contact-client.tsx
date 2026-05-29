'use client'

import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Youtube,
  Clock,
} from 'lucide-react'

function TiktokIcon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.6-.71-.11.75-.24 1.51-.4 2.26-.74 3.73-3.22 6.94-7.01 8.01-4.22 1.16-9.15-1.15-10.4-5.32C-1.32 11.23.49 6.11 4.7 4.54c1.19-.44 2.47-.57 3.72-.51v4.04c-.79-.11-1.61-.01-2.37.28-1.58.59-2.63 2.24-2.43 3.93.27 2.26 2.5 3.95 4.76 3.49 1.68-.34 2.91-1.79 3.09-3.48.16-1.53.07-3.07.09-4.61 0-2.52.01-5.04.01-7.56.02-.04.04-.08.06-.11z" />
    </svg>
  )
}

export default function ContactClient() {
  return (
    <div className="py-12 bg-background">
      {/* Decorative background blurs */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider block mb-2">
            Hubungi Kami
          </span>
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-4">
            Mulai Perjalanan Anda
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Punya pertanyaan mengenai paket open trip, private trip kustom, rental armada mobil,
            atau butuh konsultasi perjalanan? Tim kami siap melayani kebutuhan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* Phone/WhatsApp Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Hubungi Kami / WhatsApp</h3>
                <p className="text-xs text-muted-foreground">Admin fast-response</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <a
                href="https://wa.me/6282122258373"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition group border border-transparent hover:border-primary/20"
              >
                <span className="text-sm font-medium">082122258373</span>
                <span className="text-xs bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground py-1 px-3 rounded-full font-medium transition">
                  Chat
                </span>
              </a>
              <a
                href="https://wa.me/6281218091668"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition group border border-transparent hover:border-primary/20"
              >
                <span className="text-sm font-medium">081218091668</span>
                <span className="text-xs bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground py-1 px-3 rounded-full font-medium transition">
                  Chat
                </span>
              </a>
            </div>
          </motion.div>

          {/* Location & Hours Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Lokasi Kantor</h3>
                <p className="text-xs text-muted-foreground">Kunjungi kami di Serang</p>
                <a
                  href="https://maps.app.goo.gl/qpAYsxNQuSCzYtYy5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  Serang, Banten, Indonesia
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-border pt-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Jam Operasional</h3>
                <p className="text-xs text-muted-foreground">Pelayanan Chat & Pemesanan</p>
                <p className="text-sm text-muted-foreground font-medium">
                  Setiap Hari: 8.00 WIB - 20.00 WIB
                </p>
              </div>
            </div>
          </motion.div>

          {/* Email Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-foreground">E-mail Resmi</h3>
              <p className="text-xs text-muted-foreground mb-2">Kerjasama Bisnis & Kemitraan</p>
              <a
                href="mailto:info@travleairlangga.com"
                className="text-sm font-medium text-primary hover:underline break-all block"
              >
                info@travleairlangga.com
              </a>
            </div>
          </motion.div>

          {/* Social Media Link Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Ikuti Media Sosial Kami
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <a
                href="https://www.instagram.com/airlangga_travel/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition border border-transparent hover:border-primary/20 gap-2"
              >
                <Instagram className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-medium">Instagram</span>
              </a>
              <a
                href="https://www.tiktok.com/@airlanggatour_and_travel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition border border-transparent hover:border-primary/20 gap-2"
              >
                <TiktokIcon className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-medium">TikTok</span>
              </a>
              <a
                href="https://www.youtube.com/@AirlanggaTourTravel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition border border-transparent hover:border-primary/20 gap-2"
              >
                <Youtube className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-medium">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps Iframe */}
        <div className="max-w-4xl mx-auto bg-card border border-border p-3 rounded-3xl shadow-sm overflow-hidden h-96 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126953.70302862265!2d106.21830526681559!3d-6.0897920182959835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e418bcc040ed6bb%3A0xba38b712d98b063b!2sAirlangga%20Sejahtera%20Group.%20PT!5e0!3m2!1sen!2sid!4v1780071808289!5m2!1sen!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-2xl"
          ></iframe>
        </div>
      </div>
    </div>
  )
}
