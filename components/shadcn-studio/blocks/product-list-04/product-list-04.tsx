import { CircleCheckIcon, HeartIcon } from 'lucide-react'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type ProductItem = {
  productSrc: string
  productAlt: string
  name: string
  rating: number
  reviewCount: number
  features: string[]
  price: number
  discountedPrice: number
}

type ProductProps = {
  products: ProductItem[]
}

const ProductList = ({ products }: ProductProps) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='space-y-4 text-center'>
          <Badge variant='outline' className='text-sm font-normal'>
            All models
          </Badge>

          <h2 className='text-center text-2xl font-semibold sm:text-3xl lg:text-4xl'>Most popular Products</h2>
        </div>

        <div className='flex flex-col gap-6'>
          {products.map((product, index) => (
            <div key={index} className='grid gap-6 rounded-xl border p-6 sm:grid-cols-4'>
              <div className='bg-muted relative h-max rounded-lg p-4 sm:max-xl:col-span-2'>
                <img src={product.productSrc} alt={product.productAlt} className='mx-auto h-61.25' />

                <CheckboxPrimitive.Root
                  data-slot='checkbox'
                  className='group focus-visible:ring-ring/50 bg-background data-[state=checked]:bg-primary absolute top-2.5 right-2.5 rounded-full border p-1.5 shadow-xs outline-none focus-visible:ring-2'
                  aria-label='Add wishlist'
                >
                  <HeartIcon className='group-data-[state=checked]:stroke-primary-foreground size-4' />
                </CheckboxPrimitive.Root>
              </div>

              <div className='flex justify-between gap-8 max-lg:flex-col sm:col-span-2 xl:col-span-3'>
                <div className='flex flex-col gap-6'>
                  <div className='flex flex-col gap-2'>
                    <h3 className='text-2xl font-semibold'>{product.name}</h3>
                    <div className='flex items-center gap-3'>
                      <Badge className='rounded-sm bg-amber-600 text-white focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/60 dark:focus-visible:ring-amber-400/40'>
                        {product.rating}
                      </Badge>
                      <a href='#' className='text-muted-foreground font-medium underline'>
                        {product.reviewCount} Reviews
                      </a>
                    </div>
                  </div>

                  <div className='flex flex-col gap-3'>
                    {product.features.map((feature, idx) => (
                      <div key={idx} className='flex items-center gap-2'>
                        <CircleCheckIcon className='size-4' />
                        <span className='text-muted-foreground'>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className='flex items-center gap-4'>
                    <Button variant='outline' size='lg'>
                      Add to cart
                    </Button>
                    <Button size='lg' asChild>
                      <a href='#'>Buy now</a>
                    </Button>
                  </div>
                </div>

                <div className='flex flex-col items-end gap-2'>
                  <span className='text-2xl font-semibold'>${product.discountedPrice.toFixed(2)}</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground font-medium line-through'>${product.price.toFixed(2)}</span>
                    <Badge className='rounded-sm bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40'>
                      -{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                    </Badge>
                  </div>
                  <span className='text-muted-foreground font-medium'>Free Delivery</span>
                  <Badge className='bg-primary/10 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 text-primary rounded-sm border-none focus-visible:outline-none'>
                    Top Discount of the Sale
                  </Badge>
                  <p className='text-muted-foreground text-end text-sm'>
                    Upto <span className='text-card-foreground font-semibold'>$100</span> off on Exchange
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductList
