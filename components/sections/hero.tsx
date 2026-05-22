'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1920&q=80')`,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-20">
        <div className="max-w-3xl">
          <div className="space-y-6">

            {/* Heading */}
            <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-background leading-tight text-balance">
              Jelajahi Dunia Bersama{' '}
              <span className="text-accent">Airlangga Travel</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-background/90 max-w-xl leading-relaxed">
              Wujudkan perjalanan impian Anda dengan destinasi terbaik, pelayanan prima,
              dan harga yang terjangkau. Pengalaman tak terlupakan menanti!
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full px-8 h-14 text-base"
              >
                <Link href="/open-trip">
                  Lihat Open Trip
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-background text-background hover:bg-background hover:text-foreground rounded-full px-8 h-14 text-base bg-transparent"
              >
                <Link href="/private-trip">
                  <Play className="mr-2 w-5 h-5" />
                  Private Trip
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 border-2 border-background/50 rounded-full flex items-start justify-center p-2"
            >
              <motion.div className="w-1 h-2 bg-background rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
