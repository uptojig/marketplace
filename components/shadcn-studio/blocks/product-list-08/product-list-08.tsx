'use client'

import { useEffect, useState } from 'react'

import { HeartIcon } from 'lucide-react'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { Badge } from '@/components/ui/badge'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Progress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'

export type ProductItem = {
  productSrc: string
  productAlt: string
  productLink: string
  name: string
  salePercentage: number
  soldProgress: number
  sold: number
  available: number
  discountedPrice: number
  originalPrice: number
  cardClassName?: string
}

type ProductProps = {
  products: ProductItem[]
}

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const updateCountdown = () => {
      const difference = +targetDate - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) {
    return (
      <Badge variant='destructive' className='rounded-sm px-4 py-1.25 text-lg font-bold'>
        Loading...
      </Badge>
    )
  }

  const pad = (num: number) => String(num).padStart(2, '0')

  return (
    <Badge variant='destructive' className='rounded-sm px-4 py-1.25 text-lg font-bold'>
      {timeLeft.days}D : {pad(timeLeft.hours)}H : {pad(timeLeft.minutes)}M : {pad(timeLeft.seconds)}S
    </Badge>
  )
}

const ProductList = ({ products }: ProductProps) => {
  const [targetDate] = useState(() => {
    const date = new Date()

    date.setDate(date.getDate() + 1)
    date.setHours(date.getHours() + 12)
    date.setMinutes(date.getMinutes() + 15)
    date.setSeconds(date.getSeconds() + 9)

    return date
  })

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='flex items-center justify-between gap-5 max-sm:flex-col'>
          <div className='flex items-center gap-5 max-md:flex-col'>
            <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>Deals Of The Day</h2>
            <CountdownTimer targetDate={targetDate} />
          </div>

          <a href='#' className='shrink-0 text-lg font-semibold underline'>
            View All Deals
          </a>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4'>
          {products.map((product, index) => (
            <MotionPreset
              key={product.name}
              fade
              zoom={{ initialScale: 0.85 }}
              transition={{ duration: 0.25 }}
              delay={index * 0.05}
              className='flex flex-col gap-5'
            >
              <div className={cn('bg-primary/20 relative rounded-md pt-8.5', product.cardClassName)}>
                <Badge variant='destructive' className='absolute top-6 left-6 rounded-sm'>
                  -{product.salePercentage}%
                </Badge>
                <a href={product.productLink}>
                  <img src={product.productSrc} alt={product.productAlt} className='mx-auto max-h-85' />
                </a>
                <CheckboxPrimitive.Root
                  data-slot='checkbox'
                  className='group focus-visible:ring-ring/50 bg-background data-[state=checked]:bg-primary absolute top-4.75 right-6 rounded-full p-2 outline-none focus-visible:ring-2'
                  aria-label='Add wishlist'
                >
                  <HeartIcon className='group-data-[state=checked]:stroke-primary-foreground size-4' />
                </CheckboxPrimitive.Root>
              </div>
              <div className='flex flex-col gap-3'>
                <Progress value={product.soldProgress} className='h-2.5' />

                <div className='flex items-center justify-between'>
                  <div>
                    <span className='text-muted-foreground font-medium uppercase'>Sold : </span>
                    <span>{product.sold}</span>
                  </div>
                  <div>
                    <span className='text-muted-foreground font-medium uppercase'>Available : </span>
                    <span>{product.available}</span>
                  </div>
                </div>

                <a href={product.productLink}>
                  <h3 className='text-xl font-medium'>{product.name}</h3>
                </a>

                <a href={product.productLink} className='flex items-center gap-2.5'>
                  <span className='text-xl font-semibold'>${product.discountedPrice}</span>
                  <span className='text-muted-foreground text-lg font-medium line-through'>
                    ${product.originalPrice}
                  </span>
                </a>
              </div>
            </MotionPreset>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductList
