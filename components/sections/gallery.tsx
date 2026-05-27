'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X, Compass, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useEmblaCarousel from 'embla-carousel-react'

import type { GalleryItem } from '@/lib/types'

const staticGalleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Pelayaran Phinisi Komodo',
    location: 'Taman Nasional Komodo, NTT',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&q=80',
    category: 'Trip Bahari'
  },
  {
    id: '2',
    title: 'Kabut Pagi Gunung Bromo',
    location: 'Gunung Bromo, Jawa Timur',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    category: 'Pegunungan'
  },
  {
    id: '3',
    title: 'Kelingking Cliff Nusa Penida',
    location: 'Nusa Penida, Bali',
    image: 'https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=1200&q=80',
    category: 'Pantai'
  },
  {
    id: '4',
    title: 'Stupa Agung Borobudur',
    location: 'Magelang, Jawa Tengah',
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1200&q=80',
    category: 'Budaya'
  },
  {
    id: '5',
    title: 'Gugusan Karst Raja Ampat',
    location: 'Raja Ampat, Papua Barat',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    category: 'Bahari'
  },
  {
    id: '6',
    title: 'Terasering Tegalalang',
    location: 'Ubud, Bali',
    image: 'https://images.unsplash.com/photo-1552608494-18ba4c799d6a?auto=format&fit=crop&w=1200&q=80',
    category: 'Petualangan'
  },
  {
    id: '7',
    title: 'Keindahan Danau Toba',
    location: 'Samosir, Sumatera Utara',
    image: 'https://images.unsplash.com/photo-1617042371383-a13e36d92a21?auto=format&fit=crop&w=1200&q=80',
    category: 'Danau'
  }
]

interface GallerySectionProps {
  initialItems?: GalleryItem[]
}

export function GallerySection({ initialItems }: GallerySectionProps) {
  const items = initialItems && initialItems.length > 0 ? initialItems : staticGalleryItems
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: false
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const handleSlideClick = (index: number) => {
    if (!emblaApi) return
    if (index !== selectedIndex) {
      emblaApi.scrollTo(index)
    } else {
      setActiveItem(items[index])
    }
  }

  return (
    <section className="py-20 bg-background overflow-hidden relative border-t border-border/50">
      
      {/* Section Header (Centered within grid container) */}
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            Galeri Perjalanan
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
            Momen Petualangan Bersama Airlangga
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Jelajahi keindahan Indonesia melalui bidikan lensa dokumentasi otentik perjalanan para traveler kami.
          </p>
        </div>
      </div>

      {/* Infinite Looping Coverflow Carousel (Full Width) */}
      <div className="relative w-full">
        <div 
          ref={emblaRef} 
          className="overflow-hidden w-full cursor-grab active:cursor-grabbing"
        >
          <div className="flex select-none">
            {items.map((item, index) => {
              const isActive = index === selectedIndex
              return (
                <div
                  key={item.id}
                  className="flex-[0_0_75%] sm:flex-[0_0_50%] md:flex-[0_0_38%] lg:flex-[0_0_28%] px-2 sm:px-3 min-w-0 relative"
                  onClick={() => handleSlideClick(index)}
                >
                  {/* Carousel Card */}
                  <div
                    className={`w-full aspect-[3/4] relative rounded-3xl overflow-hidden border border-border/60 transition-all duration-500 ease-out ${
                      isActive
                        ? 'scale-100 opacity-100 shadow-2xl ring-4 ring-primary/10 z-10'
                        : 'scale-50 opacity-35 z-0'
                    }`}
                  >
                    {/* Image */}
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      draggable={false}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-85" />

                    {/* Category Tag */}
                    <div className="absolute top-5 left-5 z-10">
                      <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Scale Action Overlay (Only on active slide) */}
                    {isActive && (
                      <div className="absolute top-5 right-5 z-10 bg-white/10 backdrop-blur-md text-white rounded-full p-2.5 hover:bg-white/20 transition-all">
                        <Eye className="w-4.5 h-4.5" />
                      </div>
                    )}

                    {/* Text Details (Only on active slide) */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 text-white transition-all duration-500 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}
                    >
                      <span className="text-xs text-primary font-semibold tracking-wide uppercase block mb-1">
                        {item.location}
                      </span>
                      <h3 className="font-serif font-bold text-xl md:text-2xl leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-300 mt-2.5 flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Klik untuk memperbesar gambar
                      </p>
                    </div>

                    {/* Carousel Arrow Controls (Attached to Left/Right edge of the active card) */}
                    {isActive && (
                      <>
                        <Button
                          variant="default"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            emblaApi?.scrollPrev()
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-black border border-border/20 shadow-xl z-20 cursor-pointer transition-all active:scale-95"
                          aria-label="Previous Slide"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            emblaApi?.scrollNext()
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-black border border-border/20 shadow-xl z-20 cursor-pointer transition-all active:scale-95"
                          aria-label="Next Slide"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveItem(null)}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full w-12 h-12 z-20 cursor-pointer"
              onClick={() => setActiveItem(null)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Modal Image Wrapper */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl aspect-video md:aspect-[16/10] max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                <span className="text-xs text-primary font-bold tracking-wider uppercase block mb-1">
                  {activeItem.location} • {activeItem.category}
                </span>
                <h3 className="font-serif font-bold text-2xl md:text-3xl leading-tight">
                  {activeItem.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
