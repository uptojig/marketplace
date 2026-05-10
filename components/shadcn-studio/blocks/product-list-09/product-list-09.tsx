import { HeartIcon, StarIcon } from 'lucide-react'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

export type ProductItem = {
  productSrc: string
  productAlt: string
  productLink: string
  productReviewLink: string
  name: string
  rating: number
  reviewCount: number
  price: number
}

type ProductProps = {
  products: ProductItem[]
}

const ProductList = ({ products }: ProductProps) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <Carousel
        className='mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:gap-16 sm:px-6 lg:gap-24 lg:px-8'
        opts={{
          align: 'start',
          slidesToScroll: 1
        }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-4'>
            <Badge variant='outline' className='text-sm font-normal'>
              Best seller
            </Badge>
            <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>Trending In Sports Wear</h2>
          </div>

          <div className='flex items-center gap-2.5'>
            <CarouselPrevious
              variant='default'
              className='disabled:bg-primary/10 disabled:text-primary static size-9 translate-y-0 rounded-md disabled:opacity-100'
            />
            <CarouselNext
              variant='default'
              className='disabled:bg-primary/10 disabled:text-primary static size-9 translate-y-0 rounded-md disabled:opacity-100'
            />
          </div>
        </div>

        {/* Product Carousel */}
        <div className='relative'>
          <CarouselContent className='sm:-ml-6'>
            {products.map((product, index) => (
              <CarouselItem key={index} className='sm:basis-1/2 sm:pl-6 lg:basis-1/3'>
                <Card className='h-full gap-6 shadow-none'>
                  <CardContent className='flex flex-1 flex-col gap-6'>
                    <div className='relative shrink-0 overflow-hidden rounded-md'>
                      <a href={product.productLink}>
                        <img src={product.productSrc} alt={product.productAlt} className='w-full' />
                      </a>
                      <CheckboxPrimitive.Root
                        data-slot='checkbox'
                        className='group focus-visible:ring-ring/50 bg-background data-[state=checked]:bg-primary absolute top-3.5 right-2.5 rounded-full p-2 shadow-xs outline-none focus-visible:ring-2'
                        aria-label='Add wishlist'
                      >
                        <HeartIcon className='group-data-[state=checked]:stroke-primary-foreground size-4' />
                      </CheckboxPrimitive.Root>
                    </div>
                    <div className='flex flex-1 flex-col gap-4'>
                      <div className='flex flex-1 flex-col justify-between gap-2'>
                        <a href={product.productLink}>
                          <h3 className='text-xl font-medium'>{product.name}</h3>
                        </a>
                        <div className='flex items-center gap-3'>
                          <Badge className='rounded-sm bg-amber-600 text-white focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/60 dark:focus-visible:ring-amber-400/40'>
                            <StarIcon className='size-3' />
                            {product.rating}
                          </Badge>
                          <a href={product.productReviewLink} className='text-muted-foreground font-medium underline'>
                            {product.reviewCount} Reviews
                          </a>
                        </div>
                      </div>

                      <a href={product.productLink}>
                        <span className='text-2xl font-semibold'>${product.price.toFixed(2)}</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  )
}

export default ProductList
