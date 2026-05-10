'use client'

import { useEffect, useState } from 'react'

import { HeartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { CarouselApi } from '@/components/ui/carousel'

import { cn } from '@/lib/utils'

type Variant = {
  image: string
  color: string
}

export type ProductCardProps = {
  variants: [Variant, ...Variant[]]
  name: string
  price: number
  link: string
}

const ProductCard = ({ name, price, link, variants }: ProductCardProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)

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

  return (
    <Card className='relative h-112.5 gap-0 border-0 pt-0 shadow-none'>
      <Button
        variant='outline'
        size='icon-sm'
        className='bg-background! hover:bg-background/90 absolute top-6 right-6 z-10 cursor-pointer rounded-full shadow-sm'
        onClick={() => setLiked(!liked)}
      >
        <HeartIcon className={cn({ 'fill-rose-500 stroke-rose-500': liked })} />
        <span className='sr-only'>Explore</span>
      </Button>
      <div className='absolute top-7.5 left-6 z-10 flex gap-3.5'>
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn('size-3.5 cursor-pointer rounded-full transition-colors', variants[index].color, {
              'outline-1 outline-offset-1': current === index
            })}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          slidesToScroll: 1
        }}
        className='flex-1'
      >
        <CarouselContent className='h-full'>
          {variants.map((variant, index) => (
            <CarouselItem key={index} className='flex justify-center'>
              <img src={variant.image} alt={`${name} - ${variant.color}`} className='max-h-92' />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <CardFooter className='justify-between'>
        <div className='space-y-1'>
          <span className='text-muted-foreground font-medium'>{`$${price}`}</span>
          <h3 className='text-lg font-medium'>{name}</h3>
        </div>
        <Button className='rounded-full' asChild>
          <a href={link}>Buy</a>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard
