import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Instagram, Youtube } from 'lucide-react'

function TiktokIcon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/open-trip', label: 'Open Trip' },
  { href: '/private-trip', label: 'Private Trip' },
  { href: '/airlangga-car', label: 'Airlangga Car' },
  { href: '/about', label: 'About Us' },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="Airlangga Travel"
                width={160}
                height={40}
                className="object-contain brightness-0 invert"
                style={{ width: 'auto', height: '40px' }}
              />
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Airlangga Travel adalah agen perjalanan terpercaya yang menyediakan layanan Open Trip,
              Private Trip, dan rental kendaraan berkualitas dengan harga terbaik.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/airlangga_travel/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@airlanggatour_and_travel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <TiktokIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@AirlanggaTourTravel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/6282122258373"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  082122258373
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6281218091668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  081218091668
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@travleairlangga.com"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  info@travleairlangga.com
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/qpAYsxNQuSCzYtYy5"
                  className="flex items-start gap-3 text-background/70 hover:text-primary transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Serang, Indonesia</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            &copy; {new Date().getFullYear()} Airlangga Travel. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-background/50 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-background/50 hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
