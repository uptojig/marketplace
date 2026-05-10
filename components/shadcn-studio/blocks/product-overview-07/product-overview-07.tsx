'use client'

import { useEffect, useState } from 'react'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Rating } from '@/components/ui/rating'

import { cn } from '@/lib/utils'

type ProductOverviewProps = {
  productItems: {
    name: string
    description: string
    rating: number
    price: number
    hasDiscount?: boolean
    discountPercentage?: number
    images: Array<{
      src: string
      alt: string
    }>
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
  const [selectedImage, setSelectedImage] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  // Sync carousel with thumbnail selection
  useEffect(() => {
    if (!api) return

    api.scrollTo(selectedImage)
  }, [api, selectedImage])

  // Update selectedImage when carousel changes
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setSelectedImage(api.selectedScrollSnap())
    }

    api.on('select', onSelect)
    onSelect()

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {productItems.map(item => (
          <div key={item.name}>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='grid gap-6 sm:grid-cols-2 md:col-span-2'>
                <div className='flex flex-col justify-between'>
                  <h2 className='text-4xl font-semibold'>{item.name}</h2>
                  <p className='text-muted-foreground mb-9'>{item.description}</p>
                  <div className='flex gap-3'>
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        type='button'
                        onClick={() => setSelectedImage(index)}
                        className='cursor-pointer overflow-hidden rounded-md transition-all duration-200'
                      >
                        <img src={image.src} alt={image.alt} className='size-16 object-cover' />
                      </button>
                    ))}
                  </div>
                </div>
                <Carousel
                  className='w-full'
                  setApi={setApi}
                  opts={{
                    align: 'start',
                    loop: true
                  }}
                >
                  <CarouselContent>
                    {item.images.map((image, index) => (
                      <CarouselItem key={`${image.alt}-${index}`}>
                        <div className='h-82 overflow-hidden rounded-md bg-gray-100'>
                          <img src={image.src} alt={image.alt} className='h-full w-full object-cover' />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
              <div className='space-y-9 md:max-lg:col-span-2'>
                <div className='flex items-center gap-6'>
                  <h4 className='text-muted-foreground text-xl font-medium'>Shoes Color :</h4>
                  <RadioGroup className='flex' defaultValue={item.defaultColorOption}>
                    {colorsChart.map(colorItem => (
                      <label
                        key={colorItem.value}
                        className={cn(
                          `has-focus-visible:ring-ring/50 has-data-disabled:opacity-50' relative size-5 cursor-pointer rounded-full text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed`,
                          colorItem.colorOption
                        )}
                      >
                        <RadioGroupItem
                          id={colorItem.value}
                          value={colorItem.value}
                          className='sr-only after:absolute after:inset-0'
                          aria-label={`color-radio-${colorItem.value}`}
                          disabled={colorItem.disabled}
                        />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className='flex flex-col gap-3'>
                  <h4 className='text-muted-foreground text-xl font-medium'>Select Size </h4>
                  <RadioGroup className='flex' defaultValue={item.defaultSize}>
                    {sizesChart.map(sizeItem => (
                      <label
                        key={`key-${sizeItem.value}`}
                        className='border-input group has-data-[state=checked]:bg-primary has-focus-visible:border-ring has-focus-visible:ring-ring/50 bg-background relative flex cursor-pointer flex-col items-center gap-4 rounded-md border px-2 py-1 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50'
                      >
                        <RadioGroupItem
                          id={`id-${sizeItem.value}`}
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
                <div className='flex w-full justify-between gap-3'>
                  <span className='text-muted-foreground font-medium'>Price</span>
                  <span className='text-3xl font-semibold'>${item.price}</span>
                </div>
                <div className='flex w-full justify-between gap-3'>
                  <span className='text-muted-foreground font-medium'>Rating</span>
                  <Rating readOnly variant='yellow' size={24} value={item.rating} precision={0.5} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProductOverview
