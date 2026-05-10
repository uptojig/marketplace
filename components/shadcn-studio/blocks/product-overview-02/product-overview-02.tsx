'use client'

import { useId, useEffect, useState } from 'react'

import {
  StarIcon,
  TruckIcon,
  BadgePercentIcon,
  StoreIcon,
  MapPinIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon
} from 'lucide-react'

import { Button as AriaButton, Group, Input as AriaInput, NumberField } from 'react-aria-components'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Rating } from '@/components/ui/rating'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type ProductOverviewProps = {
  productItems: {
    name: string
    brand: string
    itemSold: number
    description: string
    totalReview: number
    storeLink: string
    rating: number
    price: number
    hasDiscount?: boolean
    discountPercentage?: number
    address?: string
    shippingCharges?: number
    images: Array<{
      src: string
      alt: string
    }>
    breadcrumbData: Array<{
      label: string
      href?: string
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
    src: string
    disabled?: boolean
  }[]
}

const ProductOverview = ({ productItems, colorsChart, sizesChart }: ProductOverviewProps) => {
  const id = useId()

  const [selectedImage, setSelectedImage] = useState(0)
  const [api, setApi] = useState<CarouselApi>()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(productItems[0]?.defaultColorOption || colorsChart[0]?.value || '')
  const [selectedSize, setSelectedSize] = useState(productItems[0]?.defaultSize || sizesChart[0]?.value || '')
  const [deliveryOption, setDeliveryOption] = useState('regular')

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
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {productItems.map(item => {
          // Calculate prices per item
          const originalPrice = item.price
          const discountPercentage = item.discountPercentage || 0
          const hasDiscount = item.hasDiscount && discountPercentage > 0

          const finalPrice = hasDiscount ? originalPrice - (originalPrice * discountPercentage) / 100 : originalPrice

          // Calculate delivery charges based on selected option
          const baseShipping = item.shippingCharges || 0
          const deliveryCharges = deliveryOption === '1 day' ? baseShipping + 10 : baseShipping

          const totalPrice = finalPrice * quantity + deliveryCharges

          return (
            <div key={item.name}>
              <Breadcrumb className='mb-12 md:mb-16 lg:mb-24'>
                <BreadcrumbList>
                  {item.breadcrumbData.map((breadcrumb, index) => (
                    <div key={`${breadcrumb.label}-${index}`} className='flex items-center gap-2.5'>
                      <BreadcrumbItem>
                        {index === item.breadcrumbData.length - 1 ? (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={breadcrumb.href || '#'}>{breadcrumb.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < item.breadcrumbData.length - 1 && (
                        <BreadcrumbSeparator key={`${breadcrumb.label}-sep`} />
                      )}
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                {/* Left Side - Image Carousel */}

                <div className='flex flex-col gap-8'>
                  <div>
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
                            <div className='h-99 overflow-hidden rounded-lg bg-gray-100'>
                              <img src={image.src} alt={image.alt} className='h-full w-full object-cover' />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>

                  <div className='flex justify-between gap-6'>
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        type='button'
                        onClick={() => setSelectedImage(index)}
                        className='cursor-pointer overflow-hidden rounded-sm transition-all duration-200'
                      >
                        <img src={image.src} alt={image.alt} className='size-20 object-cover' />
                      </button>
                    ))}
                  </div>

                  <div className='space-y-1 rounded-md border px-4'>
                    <div className='flex items-center gap-2 py-4'>
                      <StoreIcon className='size-5.5' />
                      <p className='text-muted-foreground flex grow items-center gap-1 font-medium'>
                        Stylish
                        <BadgePercentIcon className='text-foreground size-4' />
                      </p>
                      <StarIcon className='mb-0.5 size-4 fill-amber-500 stroke-transparent' />
                      <p className='text-muted-foreground font-semibold'>({item.rating})</p>
                      <p className='text-green-500'>{item.totalReview} Reviews</p>
                    </div>
                    <Separator />
                    <div className='flex items-center gap-2 py-4'>
                      <MapPinIcon className='text-foreground size-5.5' />
                      <p className='text-muted-foreground grow font-medium'>{item.address}</p>
                      <Button asChild variant='outline' size='sm'>
                        <a href={item.storeLink}>Visit Store</a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Product Details */}
                <div className='space-y-7'>
                  {/* Breadcrumb */}
                  <div className='space-y-3'>
                    <p className='text-muted-foreground font-medium uppercase'>{item.brand}</p>
                    {/* Product Name */}
                    <h1 className='text-2xl font-semibold'>{item.name}</h1>
                    {/* Rating */}
                    <div className='flex items-center gap-3'>
                      <Rating readOnly variant='yellow' size={16} value={item.rating} precision={0.5} />
                      <span className='text-muted-foreground font-medium'>({item.rating})</span>

                      <span className='text-green-500'>{item.totalReview} Reviews</span>
                      <span className='text-muted-foreground'>{item.itemSold} sold</span>
                    </div>
                  </div>
                  {/* Price */}
                  {!hasDiscount ? (
                    <div className='w-fit rounded-lg border px-4 py-1.5'>
                      <h4 className='text-muted-foreground text-3xl font-bold'>${finalPrice.toFixed(2)}</h4>
                    </div>
                  ) : (
                    <div className='flex w-fit items-center gap-2 rounded-lg border px-4 py-1.5'>
                      <h4 className='text-muted-foreground text-3xl font-bold'>${finalPrice.toFixed(2)}</h4>
                      <span className='text-muted-foreground line-through'>${originalPrice.toFixed(2)}</span>
                      <span className='text-destructive font-medium'>( {discountPercentage}% OFF )</span>
                    </div>
                  )}
                  {/* Color Selection */}
                  <div className='flex flex-col gap-3'>
                    <h4 className='font-semibold'>Select Color :</h4>
                    <RadioGroup
                      className='flex'
                      defaultValue={item.defaultColorOption}
                      onValueChange={setSelectedColor}
                    >
                      {colorsChart.map(colorItem => (
                        <label
                          key={`${id}-${colorItem.value}`}
                          className='has-focus-visible:ring-ring/50 has-data-[state=checked]:border-primary relative size-15 cursor-pointer overflow-hidden rounded-lg text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-data-[state=checked]:border'
                        >
                          <RadioGroupItem
                            id={`${id}-${colorItem.value}`}
                            value={colorItem.value}
                            className='sr-only after:absolute after:inset-0'
                            aria-label={`color-radio-${colorItem.value}`}
                            disabled={colorItem.disabled}
                          />
                          <img src={colorItem.src} alt={colorItem.value} className='object-cover' />
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  {/* Size Selection */}
                  <div className='flex flex-col gap-3'>
                    <h4 className='font-semibold'>Select Size </h4>
                    <RadioGroup className='flex' defaultValue={item.defaultSize} onValueChange={setSelectedSize}>
                      {sizesChart.map(sizeItem => (
                        <label
                          key={`${id}-${sizeItem.value}`}
                          className='border-input group has-data-[state=checked]:bg-primary has-focus-visible:border-ring has-focus-visible:ring-ring/50 bg-background relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-3 py-1.5 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50'
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

                  {/* Description */}
                  <div className='flex flex-col gap-3'>
                    <h4 className='font-semibold'>Description</h4>
                    <p className='text-muted-foreground font-normal'>
                      {item.description}{' '}
                      <a href='#' className='text-foreground'>
                        Read more
                      </a>
                    </p>
                  </div>

                  {/* Description */}
                  <div className='flex flex-col gap-3'>
                    <h4 className='font-semibold'>Details</h4>
                    <div className='flex items-center gap-3'>
                      <MapPinIcon className='text-muted-foreground size-5' />
                      <p className='text-muted-foreground grow font-medium'>
                        Sent from <span className='font-semibold'>{item.address}</span>
                      </p>
                    </div>
                    <Collapsible>
                      <div className='flex items-center gap-3'>
                        <TruckIcon className='text-muted-foreground size-5 shrink-0' />
                        <p className='text-muted-foreground font-medium'>
                          Shipping <span className='font-semibold'>${item.shippingCharges}</span>
                        </p>

                        <CollapsibleTrigger className='flex items-center justify-between gap-1 text-sm'>
                          Shipping Details
                          <ChevronDownIcon className='size-4 transition-transform [[data-state=open]_&]:rotate-180' />
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <p className='text-muted-foreground'>
                          To track your order, simply log in to your account and navigate to the order history section.
                          You&apos;ll find detailed information about your order status and tracking number there.
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>

                <Card className='h-fit md:max-lg:col-span-2'>
                  <CardContent className='space-y-8'>
                    <h3 className='text-muted-foreground border-b pb-3 text-2xl font-semibold'>Order Details</h3>
                    <div className='flex items-center gap-4'>
                      <span className='text-muted-foreground grow text-lg font-semibold'>Quantity</span>
                      <NumberField
                        className='w-full max-w-32 space-y-2'
                        value={quantity}
                        onChange={setQuantity}
                        minValue={1}
                        formatOptions={{
                          useGrouping: false
                        }}
                      >
                        <Group className='dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-lg border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'>
                          <AriaButton
                            slot='decrement'
                            className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground ms-2 flex aspect-square h-5.5 items-center justify-center rounded text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <MinusIcon className='size-3.5' />
                            <span className='sr-only'>Decrement</span>
                          </AriaButton>
                          <AriaInput className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none' />
                          <AriaButton
                            slot='increment'
                            className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground me-2 flex aspect-square h-5.5 items-center justify-center rounded text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <PlusIcon className='size-3.5' />
                            <span className='sr-only'>Increment</span>
                          </AriaButton>
                        </Group>
                      </NumberField>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground grow'>Color</span>
                        <span className='text-muted-foreground grow text-end capitalize'>{selectedColor}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground grow'>Size</span>
                        <span className='text-muted-foreground grow text-end uppercase'>{selectedSize}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground grow'>Price</span>
                        <span className='text-muted-foreground grow text-end'>${originalPrice.toFixed(2)}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground grow'>Discount</span>
                        <span className='text-muted-foreground grow text-end'>{discountPercentage}%</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground grow'>Delivery</span>
                          <Select defaultValue='regular' onValueChange={setDeliveryOption}>
                            <SelectTrigger
                              id={id}
                              size='sm'
                              className='bg-primary/10 !h-auto w-auto rounded-full px-2 py-1 text-xs'
                            >
                              <SelectValue placeholder='Select delivery option' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value='regular'>Regular</SelectItem>
                                <SelectItem value='1 day'>1 Day (+$10)</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <span className='text-muted-foreground grow text-end'>${deliveryCharges.toFixed(2)}</span>
                      </div>
                    </div>
                    <Collapsible>
                      <Button
                        asChild
                        className='w-full bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20 dark:focus-visible:ring-amber-400/40'
                        size='lg'
                      >
                        <CollapsibleTrigger>
                          Apply Coupon
                          <BadgePercentIcon className='size-4' />
                        </CollapsibleTrigger>
                      </Button>
                      <CollapsibleContent className='mt-3'>
                        <div className='flex items-center gap-3'>
                          <Input type='text' placeholder='Apply Coupon' />
                          <Button>Apply</Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    <div className='flex items-center gap-3 border-t pt-3'>
                      <span className='text-muted-foreground grow'>Total</span>
                      <span className='text-muted-foreground grow text-end text-lg font-medium'>
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Button variant='outline' size='lg' className='grow'>
                        Add to cart
                      </Button>
                      <Button size='lg' className='grow'>
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProductOverview
