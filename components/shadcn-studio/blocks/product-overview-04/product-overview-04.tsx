'use client'

import { useEffect, useState } from 'react'

import { TruckIcon, StoreIcon, MapPinIcon, HeartIcon, ShoppingCartIcon, CheckIcon, ChevronUpIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Rating } from '@/components/ui/rating'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

type ProductOverviewProps = {
  productItems: {
    name: string
    inStock: boolean
    address?: string
    totalReview: number
    rating: number
    price: number
    discountPercentage?: number
    hasDiscount?: boolean
    images: Array<{
      src: string
      alt: string
    }>
    deliveryOption: Array<{
      id: string
      shippingCharges: number | string
      subText: string
      estimatedDelivery: string
      shippingType: string
    }>
    paymentOption: Array<{
      id: string
      context: string
      islink?: boolean
      href?: string
      linkText?: string
    }>
  }[]
  benefits: {
    list: string
  }[]
}

const ProductOverview = ({ productItems, benefits }: ProductOverviewProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<{
    id: string
    shippingCharges: number | string
    subText: string
    estimatedDelivery: string
    shippingType: string
  } | null>(null)

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
        {productItems.map(item => {
          // Set default delivery option if not already set
          if (!selectedDeliveryOption && item.deliveryOption.length > 0) {
            setSelectedDeliveryOption(item.deliveryOption[0])
          }

          // Calculate prices per item
          const originalPrice = item.price
          const discountPercentage = item.discountPercentage || 0
          const hasDiscount = item.hasDiscount && discountPercentage > 0

          const finalPrice = hasDiscount ? originalPrice - (originalPrice * discountPercentage) / 100 : originalPrice
          const oneTime = finalPrice.toFixed(2)
          const monthly = (finalPrice / 24).toFixed(2)
          const fourMonthly = (finalPrice / 4).toFixed(2)

          return (
            <div key={item.name}>
              <div className='mb-8 space-y-4'>
                <h2 className='text-3xl font-semibold'>{item.name}</h2>
                <div className='flex flex-wrap items-center gap-3'>
                  <Rating readOnly variant='yellow' size={24} value={item.rating} precision={0.5} />
                  <p className='text-muted-foreground font-medium'>({item.rating})</p>
                  <a href='#' className='font-medium underline'>
                    {item.totalReview} Reviews
                  </a>
                  {item.inStock ? (
                    <p className='text-sm font-medium text-green-500'>In Stock</p>
                  ) : (
                    <p className='text-destructive text-sm font-medium'>Out of Stock</p>
                  )}

                  <div className='flex items-center gap-1.5'>
                    <MapPinIcon className='size-5.5' />
                    {item.address}
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <div className='flex flex-col gap-8'>
                  <div>
                    <Carousel
                      className='bg-background w-full overflow-hidden rounded-md border'
                      setApi={setApi}
                      opts={{
                        align: 'start',
                        loop: true
                      }}
                    >
                      <CarouselContent>
                        {item.images.map((image, index) => (
                          <CarouselItem key={`${image.alt}-${index}`}>
                            <div className='h-82 p-6'>
                              <img src={image.src} alt={image.alt} className='size-full object-contain' />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                  <div className='flex flex-wrap gap-6'>
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        type='button'
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          'shrink-0 overflow-hidden rounded-md border p-1 transition-all duration-200',
                          selectedImage === index ? 'border-primary' : ''
                        )}
                      >
                        <img src={image.src} alt={image.alt} className='size-16 object-cover' />
                      </button>
                    ))}
                  </div>
                </div>
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    {selectedDeliveryOption && (
                      <>
                        <h4 className='text-lg font-semibold'>{selectedDeliveryOption.shippingType} :</h4>
                        <div className='bg-muted space-y-1 rounded-md p-3'>
                          <p className='font-semibold'> {selectedDeliveryOption.subText}</p>
                          <p className='text-muted-foreground'>{selectedDeliveryOption.estimatedDelivery}</p>
                          <p
                            className={cn(
                              'font-medium',
                              selectedDeliveryOption.shippingCharges === 'Free of charge'
                                ? 'text-green-500'
                                : 'text-foreground'
                            )}
                          >
                            {selectedDeliveryOption.shippingCharges}
                          </p>
                        </div>
                      </>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost'>
                          See all delivery option <ChevronUpIcon className='[[data-state=closed]>&]:rotate-180' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='w-80'>
                        {item.deliveryOption.map(option => (
                          <DropdownMenuItem
                            key={option.id}
                            className='flex-col items-start gap-0.5'
                            onSelect={() => setSelectedDeliveryOption(option)}
                          >
                            <span className='text-sm font-semibold'>{option.shippingType}</span>
                            <span className='text-muted-foreground text-sm'>
                              {option.subText} {option.estimatedDelivery}{' '}
                            </span>
                            <span
                              className={cn(
                                'text-sm font-medium',
                                option.shippingCharges === 'Free of charge' ? 'text-green-500' : 'text-muted-foreground'
                              )}
                            >
                              {option.shippingCharges}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Collapsible className='flex w-full flex-col items-start gap-4'>
                    <div className='text-lg font-semibold'>Benefits:</div>

                    <ul className='text-muted-foreground flex w-full flex-col gap-4'>
                      {benefits.slice(0, 3).map(task => (
                        <li key={task.list} className='flex items-center gap-2'>
                          <CheckIcon className='size-4' />
                          {task.list}
                        </li>
                      ))}
                      <CollapsibleContent className='flex flex-col gap-4'>
                        {benefits.slice(3).map(task => (
                          <li key={task.list} className='flex items-center gap-2'>
                            <CheckIcon className='size-4' />
                            {task.list}
                          </li>
                        ))}
                      </CollapsibleContent>
                    </ul>

                    <CollapsibleTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <span className='[[data-state=open]>&]:hidden'>Show more</span>
                        <span className='[[data-state=closed]>&]:hidden'>Show less</span>
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
                <div className='space-y-6 lg:border-s lg:ps-6'>
                  <div className='flex gap-7'>
                    {!hasDiscount ? (
                      <h4 className='text-muted-foreground text-3xl font-bold'>${finalPrice.toFixed(2)}</h4>
                    ) : (
                      <div className='grow space-y-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground font-medium line-through'>
                            ${originalPrice.toFixed(2)}
                          </span>
                          <Badge className='border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                            -{discountPercentage}%
                          </Badge>
                        </div>
                        <h4 className='text-3xl font-semibold'>${finalPrice}</h4>
                      </div>
                    )}
                    <div className='space-y-2'>
                      {item.inStock ? (
                        <div className='flex items-center gap-2 text-green-500'>
                          <StoreIcon className='size-5' />
                          In Stock
                        </div>
                      ) : (
                        <div className='text-destructive flex items-center gap-2'>
                          <StoreIcon className='size-5' />
                          Out of Stock
                        </div>
                      )}

                      <div className='text-muted-foreground flex items-center gap-2'>
                        <TruckIcon className='size-5' />
                        Free Delivery
                      </div>
                    </div>
                  </div>
                  <RadioGroup className='w-full gap-3' defaultValue='financing'>
                    {item.paymentOption.map(option => {
                      // Determine which price to display based on option id
                      let priceDisplay = ''

                      if (option.id === 'oneTime') {
                        priceDisplay = `$${oneTime}`
                      } else if (option.id === 'financing') {
                        priceDisplay = `$${monthly}/mo`
                      } else if (option.id === 'installments') {
                        priceDisplay = `$${fourMonthly}/mo`
                      }

                      return (
                        <label
                          key={option.id}
                          htmlFor={option.id}
                          className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full cursor-pointer! gap-2 rounded-lg border p-3 shadow-xs outline-none'
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={option.id}
                            aria-describedby={`${option.id}-description`}
                            className='size-4 [&_svg]:size-2'
                          />
                          <div className='flex grow flex-col gap-2'>
                            <Label htmlFor={option.id} className='flex cursor-pointer items-center justify-between'>
                              <span>{priceDisplay}</span>
                            </Label>
                            <p id={`${option.id}-description`} className='text-muted-foreground text-sm'>
                              {option.context}{' '}
                              {option.islink && option.href ? (
                                <a href={option.href} className='text-foreground underline'>
                                  {option.linkText}
                                </a>
                              ) : null}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </RadioGroup>

                  <div className='flex flex-row gap-4'>
                    <Button size='lg' className='grow'>
                      <ShoppingCartIcon />
                      Add to cart
                    </Button>
                    <Button variant='outline' className='size-10'>
                      <HeartIcon />
                    </Button>
                  </div>
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
