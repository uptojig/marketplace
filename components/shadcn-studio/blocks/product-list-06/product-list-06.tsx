import { HeartIcon, PlusIcon, StarIcon } from 'lucide-react'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ProductCardType = {
  rating: number
  productSrc: string
  productAlt: string
  productLink: string
  productCategory: string
  name: string
  price: number
}[]

const ProductList = ({ productCards }: { productCards: ProductCardType }) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='mb-12 space-y-4 text-center md:mb-16 lg:mb-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
            Most{' '}
            <span className='relative'>
              Popular
              <span className='bg-primary absolute bottom-0 left-0 h-px w-full'></span>
            </span>{' '}
            Products
          </h2>
          <p className='text-muted-foreground max-w-6xl text-xl'>Transforming your wardrobe with the latest trends</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {/* Discount card */}
          <Card className='overflow-hidden border-none bg-yellow-300 shadow-none xl:col-span-2'>
            <CardContent className='flex flex-1 flex-col justify-between gap-6'>
              <div className='flex items-start justify-between gap-8'>
                <h3 className='text-4xl font-bold'>
                  Enjoy <span className='text-5xl text-amber-600'>20%</span> Off Your First Purchase At Crayon Curve !!
                </h3>
                <Avatar className='size-17.5 shrink-0 rounded-full'>
                  <AvatarFallback className='bg-amber-600/40 text-4xl'>🎁</AvatarFallback>
                </Avatar>
              </div>

              <div className='relative flex max-md:h-30'>
                <Button variant='destructive' size='lg' className='self-end rounded-full' asChild>
                  <a href='#'>Claim now</a>
                </Button>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-30.png'
                  alt='sale poster'
                  className='absolute right-0 -bottom-30 w-55 max-xl:-right-6 max-xl:w-45'
                />
              </div>
            </CardContent>
          </Card>

          {/* Product cards */}
          {productCards.map((product, index) => (
            <Card key={index} className='border-none shadow-none'>
              <CardContent className='flex flex-col justify-between gap-6'>
                <div className='flex items-center justify-between'>
                  <Badge className='bg-amber-600/10 py-0.75 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40'>
                    <StarIcon />
                    {product.rating}
                  </Badge>

                  <CheckboxPrimitive.Root
                    data-slot='checkbox'
                    className='group focus-visible:ring-ring/50 rounded-sm p-1.5 outline-none focus-visible:ring-3'
                    aria-label='Heart icon'
                  >
                    <span className='group-data-[state=checked]:hidden'>
                      <HeartIcon className='size-4' />
                    </span>
                    <span className='group-data-[state=unchecked]:hidden'>
                      <HeartIcon className='fill-destructive stroke-destructive size-4' />
                    </span>
                  </CheckboxPrimitive.Root>
                </div>

                <a href={product.productLink}>
                  <img src={product.productSrc} alt={product.productAlt} className='mx-auto h-47 w-max' />
                </a>

                <div className='bg-muted flex flex-col gap-1.5 rounded-md p-4'>
                  <Badge className='bg-primary/10 [a&]:hover:bg-primary/5 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 text-primary border-none focus-visible:outline-none'>
                    {product.productCategory}
                  </Badge>

                  <div className='flex flex-col gap-1'>
                    <h3 className='font-semibold'>{product.name}</h3>

                    <div className='flex items-center justify-between'>
                      <span className='text-xl font-semibold'>${product.price.toFixed(2)}</span>
                      <Button className='hover:bg-primary/10 text-primary size-6 bg-transparent'>
                        <PlusIcon className='size-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Offer card */}
          <Card className='overflow-hidden border-none bg-yellow-300 shadow-none md:max-xl:col-span-2'>
            <CardContent className='flex flex-1 flex-col justify-between gap-6'>
              <h3 className='max-w-xs text-3xl font-bold'>Buy 1, Get 1 Mix & Match Your Favorite Styles!</h3>
              <div className='relative flex max-xl:h-50'>
                <Button variant='destructive' size='lg' className='self-end rounded-full' asChild>
                  <a href='#'>Claim now</a>
                </Button>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-31.png'
                  alt='sale poster'
                  className='absolute -right-5 -bottom-6 w-41'
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default ProductList
