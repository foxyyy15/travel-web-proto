'use client'

import { motion } from 'framer-motion'
import { Compass, ArrowLeft, MessageCircle, Globe, MapPin, Plane, HelpCircle, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface UnderConstructionProps {
  type: 'about' | 'contact' | '404'
}

export function UnderConstruction({ type }: UnderConstructionProps) {
  const isAbout = type === 'about'
  const isContact = type === 'contact'
  const is404 = type === '404'

  // Content configurations based on type
  const config = {
    about: {
      tag: 'Under Construction',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      title: 'Kami Sedang Merancang Petualangan Terbaik Anda',
      description: 'Halaman Tentang Kami sedang dalam tahap pengembangan untuk menyajikan cerita lengkap perjalanan kami, tim kami, dan visi kami dalam membawa Anda menjelajahi dunia.',
      primaryBtnText: 'Kembali ke Beranda',
      primaryBtnHref: '/',
      secondaryBtnText: 'Hubungi WhatsApp',
      secondaryBtnHref: 'https://wa.me/6208111211143?text=Halo%20Airlangga%20Travel,%20saya%20ingin%20tahu%20lebih%20banyak%20tentang%20layanan%20Anda.',
      showWAIcon: true,
      illustration: 'compass',
    },
    contact: {
      tag: 'Coming Soon',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      title: 'Halaman Kontak Sedang Kami Persiapkan',
      description: 'Kami sedang membangun cara yang lebih mudah bagi Anda untuk terhubung. Untuk saat ini, Anda bisa langsung menghubungi kami via WhatsApp atau Email untuk merencanakan trip Anda.',
      primaryBtnText: 'Hubungi via WhatsApp',
      primaryBtnHref: 'https://wa.me/6208111211143?text=Halo%20Airlangga%20Travel,%20saya%20ingin%20berkonsultasi%20mengenai%20rencana%20trip.',
      secondaryBtnText: 'Lihat Jadwal Open Trip',
      secondaryBtnHref: '/open-trip',
      showWAIcon: true,
      illustration: 'globe',
    },
    404: {
      tag: '404 Not Found',
      badgeColor: 'bg-destructive/10 text-destructive border-destructive/20',
      title: 'Kompas Anda Kehilangan Arah?',
      description: 'Halaman yang Anda cari tidak ditemukan atau mungkin sedang dalam masa rekonstruksi rute perjalanan baru kami.',
      primaryBtnText: 'Kembali ke Beranda',
      primaryBtnHref: '/',
      secondaryBtnText: 'Lihat Jadwal Open Trip',
      secondaryBtnHref: '/open-trip',
      showWAIcon: false,
      illustration: 'lost',
    },
  }[type]

  // Floating animations for background items
  const floatingVariants = {
    animate: (custom: number) => ({
      y: [0, -15, 0],
      rotate: [0, custom * 10, 0],
      transition: {
        duration: 4 + custom,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }),
  }

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16 md:py-24 bg-gradient-to-b from-secondary/50 via-background to-background">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-accent/10 blur-3xl" />

      {/* Floating Travel Icons Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <motion.div
          custom={1.2}
          variants={floatingVariants}
          animate="animate"
          className="absolute top-[25%] left-[15%] text-primary/20 dark:text-primary/10"
        >
          <Plane className="w-12 h-12" />
        </motion.div>
        <motion.div
          custom={2}
          variants={floatingVariants}
          animate="animate"
          className="absolute bottom-[30%] left-[20%] text-primary/20 dark:text-primary/10"
        >
          <MapPin className="w-10 h-10" />
        </motion.div>
        <motion.div
          custom={1.5}
          variants={floatingVariants}
          animate="animate"
          className="absolute top-[30%] right-[15%] text-primary/20 dark:text-primary/10"
        >
          <Globe className="w-14 h-14" />
        </motion.div>
        <motion.div
          custom={0.8}
          variants={floatingVariants}
          animate="animate"
          className="absolute bottom-[25%] right-[20%] text-primary/20 dark:text-primary/10"
        >
          <Wrench className="w-10 h-10" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          
          {/* Main Visual Illustration with Animation */}
          <div className="relative mb-8 flex justify-center items-center">
            {/* Glowing background ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full bg-primary/20 blur-xl"
            />
            
            {/* Main Interactive Circle */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-card border border-border shadow-xl flex items-center justify-center backdrop-blur-sm">
              {config.illustration === 'compass' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                  className="text-primary"
                >
                  <Compass className="w-16 h-16 md:w-20 md:h-20" />
                </motion.div>
              )}

              {config.illustration === 'globe' && (
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="text-primary flex flex-col items-center"
                >
                  <Globe className="w-16 h-16 md:w-20 md:h-20" />
                  <motion.div
                    animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="w-10 h-1.5 bg-foreground/10 rounded-full blur-xs mt-2"
                  />
                </motion.div>
              )}

              {config.illustration === 'lost' && (
                <div className="relative text-primary flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  >
                    <Compass className="w-16 h-16 md:w-20 md:h-20 opacity-40" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute text-destructive"
                  >
                    <HelpCircle className="w-12 h-12 md:w-16 md:h-16" />
                  </motion.div>
                </div>
              )}

              {/* Little gear spin badge representing construction */}
              {!is404 && (
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-accent/80 border border-primary/20 flex items-center justify-center text-accent-foreground shadow-md"
                >
                  <Wrench className="w-4 h-4 animate-pulse" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Badge Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider mb-6 ${config.badgeColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            {config.tag}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 leading-tight max-w-2xl text-balance"
          >
            {config.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10 max-w-2xl text-balance font-sans"
          >
            {config.description}
          </motion.p>

          {/* Call-to-Actions (CTAs) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            {isContact ? (
              // Contact Page Direct WA Button
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full px-8 h-12 text-base shadow-md shadow-primary/20 w-full sm:w-auto"
              >
                <a href={config.primaryBtnHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  {config.primaryBtnText}
                </a>
              </Button>
            ) : (
              // About/404 Back to Home Button
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full px-8 h-12 text-base shadow-md shadow-primary/20 w-full sm:w-auto"
              >
                <Link href={config.primaryBtnHref}>
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  {config.primaryBtnText}
                </Link>
              </Button>
            )}

            {/* Secondary Button */}
            {config.secondaryBtnHref.startsWith('http') ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base border-border hover:bg-accent/10 dark:hover:bg-input/20 w-full sm:w-auto"
              >
                <a href={config.secondaryBtnHref} target="_blank" rel="noopener noreferrer">
                  {config.showWAIcon && <MessageCircle className="mr-2 w-5 h-5 text-primary" />}
                  {config.secondaryBtnText}
                </a>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base border-border hover:bg-accent/10 dark:hover:bg-input/20 w-full sm:w-auto"
              >
                <Link href={config.secondaryBtnHref}>
                  {config.secondaryBtnText}
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
