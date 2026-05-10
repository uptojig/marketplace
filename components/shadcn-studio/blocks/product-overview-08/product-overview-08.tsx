'use client'

import { useId, useState } from 'react'

import { HeartIcon, MinusIcon, PlusIcon, Share2Icon } from 'lucide-react'
import { Button as AriaButton, Group, Input as AriaInput, NumberField } from 'react-aria-components'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Rating } from '@/components/ui/rating'

type ProductOverviewProps = {
  productItems: {
    name: string
    description: string
    totalReview: number
    rating: number
    price: number
    discountPercentage?: number
    hasDiscount?: boolean
    images: {
      src: string
      alt: string
    }[]
    defaultSize?: string
    defaultColorOption?: string
  }[]
  colorsChart: {
    value: string
    colorOption: string
    disabled?: boolean
  }[]
  paymentMethods: {
    image: string
    alt: string
    offer: string
  }[]
}

const ProductOverview = ({ productItems, colorsChart, paymentMethods }: ProductOverviewProps) => {
  const id = useId()
  const [quantity, setQuantity] = useState(1)

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {productItems.map(item => {
          // Calculate prices per item
          const originalPrice = item.price
          const discountPrice = item.discountPercentage || 0
          const hasDiscount = item.hasDiscount && discountPrice > 0

          const finalPrice = originalPrice - discountPrice

          return (
            <div key={item.name} className='grid grid-cols-1 items-center gap-12 md:grid-cols-2'>
              {/* Left Side - Image Carousel */}
              <Carousel className='w-full'>
                <CarouselContent>
                  {item.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className='relative h-145 overflow-hidden rounded-md'>
                        <img src={image.src} alt='chair' className='size-full object-cover' />
                        <div className='absolute bottom-0 flex h-34 w-full items-end justify-between bg-linear-to-b from-transparent to-black/60 px-7 pb-5.5'>
                          <div className='flex flex-col gap-0.5'>
                            <span className='text-sm text-white'>Designed By</span>
                            <span className='font-semibold text-white'>Lincoln Bator</span>
                          </div>
                          <div className='flex gap-4 text-white'>
                            <a href='#' className='flex items-center gap-1 text-sm'>
                              <Share2Icon className='size-5' />
                              Share
                            </a>
                            <a href='#' className='flex items-center gap-1 text-sm'>
                              <HeartIcon className='size-5' />
                              6985
                            </a>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  variant='default'
                  className='disabled:bg-card/80 disabled:text-primary left-6 translate-y-0 disabled:opacity-100'
                />
                <CarouselNext
                  variant='default'
                  className='disabled:bg-card/80 disabled:text-primary right-6 translate-y-0 disabled:opacity-100'
                />
              </Carousel>

              {/* Right Side - Product Details */}
              <div className='space-y-8'>
                <div className='space-y-4'>
                  <h1 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{item.name}</h1>

                  {/* Rating */}
                  <div className='flex items-center gap-2'>
                    <Rating readOnly variant='yellow' size={24} value={item.rating} precision={0.5} />
                    <p className='text-muted-foreground font-medium'>{item.totalReview} Reviews</p>
                  </div>
                </div>

                {/* Description */}
                <p className='text-muted-foreground'>{item.description}</p>

                {/* Price */}
                {!hasDiscount ? (
                  <h4 className='text-3xl font-semibold'>${finalPrice.toFixed(2)}</h4>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <h4 className='text-3xl font-semibold'>${finalPrice.toFixed(2)}</h4>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground text-lg line-through'>${originalPrice.toFixed(2)}</span>
                      <Badge className='rounded-sm bg-green-600/10 text-green-600 uppercase focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                        ${discountPrice} Off
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                <div className='flex items-center gap-6'>
                  <h4 className='text-lg font-semibold'>Color :</h4>
                  <RadioGroup className='flex' defaultValue={item.defaultColorOption}>
                    {colorsChart.map(colorItem => (
                      <label
                        key={`${id}-${colorItem.value}`}
                        className={cn(
                          `has-focus-visible:ring-ring/50 has-data-disabled:opacity-50' relative size-5 cursor-pointer rounded-full text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed`,
                          colorItem.colorOption
                        )}
                      >
                        <RadioGroupItem
                          id={`${id}-${colorItem.value}`}
                          value={colorItem.value}
                          className='sr-only after:absolute after:inset-0'
                          aria-label={`color-radio-${colorItem.value}`}
                          disabled={colorItem.disabled}
                        />
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Payment Methods */}
                <div className='w-fit rounded-lg border p-5'>
                  <div className='flex gap-7'>
                    <div className='flex flex-col gap-5'>
                      {paymentMethods.slice(0, 2).map((method, index) => (
                        <div key={index} className='flex items-center gap-2.5'>
                          <div className='bg-muted flex h-5 w-10.5 items-center justify-center rounded-xs p-1'>
                            <img src={method.image} alt={method.alt} className='h-3.5 object-contain' />
                          </div>
                          <span className='text-sm'>{method.offer}</span>
                        </div>
                      ))}
                    </div>
                    <Separator orientation='vertical' className='!h-15 max-sm:!h-25 md:max-lg:!h-25' />
                    {/* <Separator className='sm:hidden' /> */}
                    <div className='flex flex-col gap-5'>
                      {paymentMethods.slice(2).map((method, index) => (
                        <div key={index} className='flex items-center gap-2.5'>
                          <div className='bg-muted flex h-5 w-10.5 items-center justify-center rounded-xs p-1'>
                            <img src={method.image} alt={method.alt} className='max-h-4 object-contain' />
                          </div>
                          <span className='text-sm'>{method.offer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <NumberField
                    className='flex-1 space-y-2'
                    value={quantity}
                    onChange={setQuantity}
                    minValue={1}
                    formatOptions={{
                      useGrouping: false
                    }}
                  >
                    <Group className='dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 grow items-center overflow-hidden rounded-lg border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'>
                      <AriaButton
                        slot='decrement'
                        className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground ms-2 flex aspect-square h-5.5 items-center justify-center rounded-sm text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <MinusIcon className='size-3.5' />
                        <span className='sr-only'>Decrement</span>
                      </AriaButton>
                      <AriaInput className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none' />
                      <AriaButton
                        slot='increment'
                        className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground me-2 flex aspect-square h-5.5 items-center justify-center rounded-sm text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <PlusIcon className='size-3.5' />
                        <span className='sr-only'>Increment</span>
                      </AriaButton>
                    </Group>
                  </NumberField>

                  <Button className='flex-1'>Buy Now</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProductOverview
