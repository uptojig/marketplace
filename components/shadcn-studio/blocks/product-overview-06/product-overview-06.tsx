import { MapPinIcon, CircleIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Rating } from '@/components/ui/rating'
import { Label } from '@/components/ui/label'

type ProductOverviewProps = {
  productItems: {
    name: string
    heading: string
    description: string
    inStock: boolean
    address?: string
    totalReview: number
    rating: number
    imageSrcLight: string
    imageSrcDark: string
    imageAlt: string
    paymentOption: Array<{
      id: string
      title: string
      context: string
      price: number
    }>
  }[]
  features: {
    title: string
    description: string
  }[]
}

const ProductOverview = ({ productItems, features }: ProductOverviewProps) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {productItems.map(item => (
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
            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8'>
              <div className='space-y-6'>
                <div>
                  <img src={item.imageSrcLight} alt={item.imageAlt} className='size-full dark:hidden' />
                  <img src={item.imageSrcDark} alt={item.imageAlt} className='hidden size-full dark:inline-block' />
                </div>
                <div>
                  <h4 className='mb-4 text-lg font-medium'>{item.heading}</h4>
                  <p className='text-muted-foreground text-sm'>{item.description}</p>
                </div>
                <div>
                  <h4 className='mb-4 text-lg font-medium'>Features</h4>
                  <div className='space-y-4'>
                    {features.map(featuresItems => (
                      <div key={featuresItems.title} className='flex gap-2'>
                        <CircleIcon className='fill-muted-foreground mt-1.5 size-2 shrink-0 stroke-0' />
                        <p className='text-muted-foreground text-sm'>
                          <span className='font-medium'>{featuresItems.title}</span> {featuresItems.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='space-y-6'>
                <h4 className='text-xl font-semibold'>Choose your plan</h4>
                <RadioGroup className='w-full gap-4' defaultValue='multipleUse'>
                  {item.paymentOption.map(option => (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full cursor-pointer gap-3 rounded-lg border p-3 outline-none'
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        aria-describedby={`${option.id}-description`}
                        className='mt-1 size-4 [&_svg]:size-2'
                      />
                      <div className='flex grow flex-col gap-2'>
                        <Label htmlFor={option.id} className='flex cursor-pointer gap-3'>
                          <span className='flex grow flex-col gap-2 text-sm'>
                            <span>{option.title}</span>
                            <span className='text-muted-foreground font-normal'>{option.context}</span>
                          </span>
                          <span className='text-2xl font-semibold'>${option.price}</span>
                        </Label>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <div className='flex items-center gap-2'>
                  <Button size='lg' className='grow'>
                    Buy now{' '}
                  </Button>
                  <Button size='lg' variant='outline' className='grow'>
                    Live preview
                  </Button>
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
