'use client'

import { useId, useState } from 'react'

import { MinusIcon, PlusIcon, HeartIcon } from 'lucide-react'
import { Button as AriaButton, Group, Input as AriaInput, NumberField } from 'react-aria-components'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Rating } from '@/components/ui/rating'
import { cn } from '@/lib/utils'

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
    brandName?: string
    warranty?: string
    defaultSize?: string
    defaultColorOption?: string
  }[]
  sizesChart: {
    value: string
    label: string
    disabled?: boolean
  }[]
  colorsChart: {
    value: string
    colorOption: string
    disabled?: boolean
  }[]
}

const ProductOverview = ({ productItems, colorsChart, sizesChart }: ProductOverviewProps) => {
  const id = useId()
  const [selectedSize, setSelectedSize] = useState(productItems[0]?.defaultSize || sizesChart[0]?.value || '')
  const [selectedColor, setSelectedColor] = useState(productItems[0]?.defaultColorOption || colorsChart[0]?.value || '')
  const [quantity, setQuantity] = useState(1)

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {productItems.map(item => {
          const originalPrice = item.price
          const discountPercentage = item.discountPercentage || 0
          const hasDiscount = item.hasDiscount && discountPercentage > 0

          const finalPrice = hasDiscount ? originalPrice - (originalPrice * discountPercentage) / 100 : originalPrice

          return (
            <div key={item.name} className='space-y-8 sm:space-y-16 lg:space-y-24'>
              <Carousel className='w-full'>
                <CarouselContent>
                  {item.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className='bg-muted flex h-145 items-center justify-center overflow-hidden rounded-xl max-sm:h-80'>
                        <div className='relative xl:w-[calc(100%-9rem)]'>
                          <img src={image.src} alt={image.alt} className='object-cover' />
                          <div className='bg-foreground/70 absolute inset-x-0 bottom-0 h-10.5 w-[calc(100%-5rem)] rounded-[50%] blur-2xl'></div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  variant='default'
                  className='disabled:bg-primary/10 disabled:text-primary left-4 translate-y-0 disabled:opacity-100 lg:left-7'
                />
                <CarouselNext
                  variant='default'
                  className='disabled:bg-primary/10 disabled:text-primary right-4 translate-y-0 disabled:opacity-100 lg:right-7'
                />
              </Carousel>

              <div className='grid items-center gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <div className='flex flex-col gap-6 lg:col-span-2'>
                  {/* Product Name & Description */}
                  <div className='space-y-4'>
                    <h1 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{item.name}</h1>

                    <p className='text-muted-foreground text-xl'>{item.description}</p>
                  </div>

                  {/* Color Selection */}
                  <div className='flex items-center gap-6'>
                    <h4 className='text-lg font-semibold'>Shoes Color:</h4>
                    <RadioGroup
                      className='flex'
                      defaultValue={item.defaultColorOption}
                      onValueChange={setSelectedColor}
                    >
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

                  {/* Size Selection */}
                  <div className='flex flex-col gap-2.5'>
                    <h4 className='text-lg font-semibold'>Select Size:</h4>
                    <RadioGroup className='flex' defaultValue={item.defaultSize} onValueChange={setSelectedSize}>
                      {sizesChart.map(sizeItem => (
                        <label
                          key={`${id}-${sizeItem.value}`}
                          className='border-input group has-data-[state=checked]:bg-primary has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-3 py-1.5 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50'
                        >
                          <RadioGroupItem
                            id={`${id}-${sizeItem.value}`}
                            value={sizeItem.value}
                            className='sr-only after:absolute after:inset-0'
                            aria-label={`size-radio-${sizeItem.value}`}
                            disabled={sizeItem.disabled}
                          />
                          <p className='text-foreground group-has-data-[state=checked]:text-primary-foreground text-sm leading-none font-medium'>
                            {sizeItem.label}
                          </p>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Price & Rating */}
                  <div className='flex flex-wrap items-center gap-6'>
                    <div className='grow'>
                      {!hasDiscount ? (
                        <h4 className='text-2xl font-semibold md:text-3xl'>${finalPrice}</h4>
                      ) : (
                        <div className='flex flex-col gap-2'>
                          <h4 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>${finalPrice.toFixed(2)}</h4>
                          <p className='text-muted-foreground text-lg font-medium line-through'>
                            MRP ${originalPrice.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex grow items-center gap-2'>
                      <p className='text-xl font-semibold'>Review</p>
                      <div className='flex items-center gap-2'>
                        <Rating readOnly variant='yellow' size={24} value={item.rating} precision={0.5} />
                        <p className='text-muted-foreground'>{item.totalReview} Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='mb-4 text-2xl font-semibold'>Product Details</h3>
                  <div className='mb-7 space-y-4'>
                    <div className='flex items-center gap-3'>
                      <span className='grow text-xl font-medium'>Brand:</span>
                      <span className='text-muted-foreground grow text-end text-lg'>{item.brandName}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='grow text-xl font-medium'>Warranty:</span>
                      <span className='text-muted-foreground grow text-end text-lg'>{item.warranty}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='grow text-xl font-medium'>Color:</span>
                      <span className='text-muted-foreground grow text-end text-lg capitalize'>{selectedColor}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='grow text-xl font-medium'>Size:</span>
                      <span className='text-muted-foreground grow text-end text-lg capitalize'>{selectedSize}</span>
                    </div>
                  </div>

                  <div className='mb-4 flex gap-3'>
                    <NumberField
                      className='w-full grow space-y-2'
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

                    <Button variant='outline' size='icon'>
                      <HeartIcon />
                    </Button>
                  </div>

                  <Button className='w-full'>Buy Now</Button>
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
