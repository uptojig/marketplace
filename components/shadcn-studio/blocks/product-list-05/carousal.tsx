'use client'

import { useEffect, useRef, useState } from 'react'

import { annotate } from 'rough-notation'

import { ShoppingCartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'

import { cn } from '@/lib/utils'

const ProductCarousel = ({ productImages }: { productImages: string[] }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const elementRef = useRef<HTMLHeadingElement>(null)
  const annotationRef = useRef<any>(null)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  useEffect(() => {
    const element = elementRef.current

    if (annotationRef.current) {
      annotationRef.current.remove()
      annotationRef.current = null
    }

    if (element) {
      const timer = setTimeout(() => {
        const annotation = annotate(element, {
          type: 'underline',
          color: 'var(--primary)',
          strokeWidth: 2,
          animationDuration: 700,
          iterations: 2,
          padding: 2,
          multiline: true
        })

        annotation.show()
        annotationRef.current = annotation
      }, 300)

      return () => {
        clearTimeout(timer)

        if (annotationRef.current) {
          annotationRef.current.remove()
          annotationRef.current = null
        }
      }
    }

    return () => {
      if (annotationRef.current) {
        annotationRef.current.remove()
        annotationRef.current = null
      }
    }
  }, [current])

  return (
    <Carousel setApi={setApi} className='relative'>
      <CarouselContent>
        {productImages.map((image, index) => (
          <CarouselItem key={index}>
            <img src={image} alt='Men suit' className='h-103.75' />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className='bg-card absolute bottom-0 flex w-full translate-y-full flex-col items-center gap-4 px-6 pt-4 opacity-0 duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
        <div className='flex gap-2'>
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'size-2.5 cursor-pointer rounded-full transition-colors',
                index === current ? 'bg-primary' : 'bg-muted'
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <Button variant='outline' size='lg' className='w-full'>
          Add to Cart
          <ShoppingCartIcon />
        </Button>
      </div>
    </Carousel>
  )
}

export default ProductCarousel
