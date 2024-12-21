'use client'

import { useState } from 'react'
import { VehicleImage } from '@/types/vehicle'
import styles from '@/styles/ImageCarousel.module.css'

interface ImageCarouselProps {
  images: VehicleImage[]
  altText: string
}

export default function ImageCarousel({ images, altText }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (!images.length) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError('Failed to load image')
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.imageContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <span className={styles.loadingSpinner}></span>
          </div>
        )}
        {error && (
          <div className={styles.errorOverlay}>
            <span>{error}</span>
          </div>
        )}
        <img
          src={images[currentIndex].url}
          alt={altText}
          className={`${styles.image} ${isLoading ? styles.loading : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className={`${styles.navButton} ${styles.previous}`}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className={`${styles.navButton} ${styles.next}`}
              aria-label="Next image"
            >
              →
            </button>
            <div className={styles.indicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    index === currentIndex ? styles.active : ''
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 