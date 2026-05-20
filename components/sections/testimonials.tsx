'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { testimonials as staticTestimonials } from '@/lib/data'
import type { Testimonial } from '@/lib/types'

export function TestimonialsSection({ initialTestimonials }: { initialTestimonials?: Testimonial[] }) {
  const displayTestimonials = initialTestimonials || staticTestimonials
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)
  }

  const currentTestimonial = displayTestimonials[currentIndex]

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4 text-balance">
            Apa Kata Mereka?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Pengalaman nyata dari traveler yang sudah mempercayakan perjalanannya bersama kami
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-3xl shadow-lg border border-border p-8 md:p-12">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Quote className="w-6 h-6 text-primary-foreground" />
            </div>

            {mounted ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < currentTestimonial.rating
                            ? 'text-primary fill-primary'
                            : 'text-border'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg md:text-xl text-card-foreground leading-relaxed mb-8">
                    &quot;{currentTestimonial.comment}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden">
                      <Image
                        src={currentTestimonial.avatar}
                        alt={currentTestimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground">
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {currentTestimonial.location} • {currentTestimonial.tripTitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="pt-4">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentTestimonial.rating
                          ? 'text-primary fill-primary'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-card-foreground leading-relaxed mb-8">
                  &quot;{currentTestimonial.comment}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentTestimonial.location} • {currentTestimonial.tripTitle}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="rounded-full border-border hover:border-primary hover:text-primary"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="rounded-full border-border hover:border-primary hover:text-primary"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {displayTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-primary w-6' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
