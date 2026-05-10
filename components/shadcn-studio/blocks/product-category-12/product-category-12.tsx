import type { ReactNode } from 'react'

import { MoveRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ProductCard = {
  img: string
  title: string
  discountNumber?: number
  newArrival?: boolean
  productLink: string
  icon: ReactNode
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex gap-8 max-sm:flex-col sm:mb-16 sm:items-center lg:mb-24'>
          <div className='grow space-y-4'>
            <Badge variant='outline' className='text-sm font-normal'>
              Category
            </Badge>
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Browse by Category</h2>
            <p className='text-muted-foreground text-xl'>
              Check out our gallery to discover more about our awesome products and what they can do!
            </p>
          </div>
          <Button size='lg' className='group w-fit rounded-lg text-base'>
            Explore All Category{' '}
            <MoveRightIcon className='size-5 transition-transform duration-200 group-hover:translate-x-0.5' />
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
          {productCards.map((item, index) => (
            <a
              href={item.productLink}
              key={`${item.title}-${index}`}
              className='bg-background relative flex flex-col rounded-xl border transition-shadow duration-200 hover:shadow-md'
            >
              <div className='flex h-75 items-center justify-center border-b p-6'>
                <img src={item.img} alt={item.title} className='h-50 w-auto object-contain' />
              </div>
              <div className='flex items-center p-6'>
                <h5 className='text-base-content flex items-center gap-3 text-xl font-medium'>
                  {item.icon}
                  {item.title}
                </h5>
              </div>

              {item.newArrival ? (
                <Badge className='absolute end-6 top-6 rounded-sm bg-green-600 text-white dark:bg-green-400/60'>
                  New Arrival
                </Badge>
              ) : null}

              {!item.newArrival && item.discountNumber ? (
                <Badge variant='destructive' className='absolute end-6 top-6 rounded-sm'>
                  {item.discountNumber}% Off
                </Badge>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
