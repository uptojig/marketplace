'use client'

import { useEffect, useState } from 'react'

import { Separator } from '@/components/ui/separator'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Rating } from '@/components/ui/rating'

import { cn } from '@/lib/utils'

type ProductReviewsProps = {
  reviewItems: {
    id: number
    name: string
    description: string
    rating: number
    date: string
    image: string
    iconImage: string
    iconName: string
    discountedPrice: number
    price: number
  }[]
}

const ProductReviews = ({ reviewItems }: ProductReviewsProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    const handleResize = () => {
      setCount(api.scrollSnapList().length)
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [api])

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto px-4 sm:max-w-7xl sm:px-6 lg:px-8'>
        <h2 className='mb-12 text-center text-3xl font-semibold'>What People Are Saying</h2>
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            slidesToScroll: 1
          }}
        >
          <CarouselContent>
            {reviewItems.map(item => (
              <CarouselItem key={`${item.name}-${item.id}`} className='ps-6 sm:basis-1/2'>
                <div className='border-base-content/20 bg-base-100 grid rounded-xl border lg:grid-cols-2'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='h-full w-full object-cover max-lg:rounded-t-xl lg:rounded-s-xl'
                  />
                  <div className='flex flex-col justify-center gap-6 p-6'>
                    <h4 className='text-xl font-semibold'>{item.name}</h4>
                    <p className='text-muted-foreground'>{item.description}</p>
                    <div>
                      <Rating readOnly variant='yellow' size={24} value={item.rating} precision={0.5} />
                    </div>
                    <span className='font-semibold'>{item.date}</span>
                    <Separator />
                    <div className='inline-flex items-center gap-4'>
                      <div className='avatar'>
                        <div className='size-15 rounded-full'>
                          <img src={item.iconImage} alt='Samantha Green' />
                        </div>
                      </div>
                      <div className='space-y-0.5'>
                        <h4 className='font-semibold'>{item.iconName}</h4>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>${item.discountedPrice}</span>
                          <span className='text-muted-foreground line-through'>${item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className='mt-12 flex items-center justify-center gap-2'>
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={`slide-indicator-${index}`}
                type='button'
                className={cn(
                  'size-3 cursor-pointer rounded-full transition-colors',
                  index === current ? 'bg-primary' : 'bg-muted'
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  )
}

export default ProductReviews
