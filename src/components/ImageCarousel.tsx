'use client'

import { useState } from 'react'
import Image from 'next/image'
import { deleteVehicleImage } from '@/app/actions'

type ImageCarouselProps = {
  images: Array<{
    id: number
    url: string
    isPrimary: boolean
  }>
  onImageDelete?: (imageId: number) => Promise<void>
  className?: string
}

export default function ImageCarousel({ images, onImageDelete, className = '' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  if (!images.length) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-secondary">No images</span>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex].url}
          alt={`Vehicle image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentIndex === 0}
        />
        
        {/* Navigation buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Delete button */}
        {onImageDelete && (
          <button
            onClick={() => onImageDelete(images[currentIndex].id)}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
            aria-label="Delete image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Image counter */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors
                ${currentIndex === index 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-primary/50'
                }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
              {image.isPrimary && (
                <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-xs py-0.5 text-center">
                  Primary
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 