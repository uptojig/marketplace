import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'
import { MotionPreset } from '@/components/ui/motion-preset'

export type ProductCard = {
  img: string
  title: string
  description: string
  productLink: string
  classNames: string
  imageNames: string
}[]

export type DiscountCard = {
  badge: string
  title: string
  discount: number
  description: string
  categoryLink: string
  classNames: string
  badgeClass: string
}[]

const ProductCategory = ({
  productCards,
  discountCards
}: {
  productCards: ProductCard
  discountCards: DiscountCard
}) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex gap-8 max-md:flex-col sm:mb-16 lg:mb-24'>
          <MotionPreset
            className='space-y-4 md:basis-1/2'
            fade
            slide={{ offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
          >
            <Badge variant='outline' className='text-sm font-normal'>
              Shop by category
            </Badge>
            <h2 className='text-6xl font-semibold'>
              Fresh Arrivals <span className='font-normal'>and</span> New Selections
            </h2>
          </MotionPreset>
          <MotionPreset
            className='basis-1/2 space-y-6'
            fade
            slide={{ direction: 'right', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
          >
            <p className='text-muted-foreground text-xl'>
              Explore our latest offerings with Fresh Arrivals and New Selections, featuring the trendiest products and
              unique finds to refresh your collection. Discover exciting styles and exclusive items that elevate your
              shopping experience!
            </p>
            <Button size='lg' className='w-fit rounded-lg text-base'>
              See All Category
            </Button>
          </MotionPreset>
        </div>

        <div className='grid grid-cols-1 place-items-center gap-12 sm:grid-cols-2 lg:grid-cols-4'>
          {discountCards.map((item, index) => (
            <MotionPreset
              key={`${item.title}-${index}`}
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.3}
              blur
              transition={{ duration: 0.9 }}
            >
              <a
                href={item.categoryLink}
                className={cn(
                  'block h-120 max-w-67 overflow-hidden rounded-full px-6 py-20 text-center transition-all duration-300 hover:ring-2',
                  item.classNames
                )}
              >
                <div className='flex flex-col items-center text-center'>
                  <div className='mb-4'>
                    <Badge className={item.badgeClass}>{item.badge}</Badge>
                  </div>
                  <div className='mb-13'>
                    <p className='text-3xl font-semibold'>UPTO</p>
                    <p className='text-6xl font-bold text-sky-600'>{item.discount}%</p>
                    <p className='text-3xl font-semibold'>Discount</p>
                  </div>
                  <div className='space-y-2 text-balance'>
                    <h3 className='text-2xl font-semibold'>{item.title}</h3>
                    <p className='text-muted-foreground line-clamp-1 text-sm'>{item.description}</p>
                  </div>
                </div>
              </a>
            </MotionPreset>
          ))}
          {productCards.map((item, index) => (
            <MotionPreset
              key={`${item.title}-${index}`}
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.3 + index * 0.15}
              blur
              transition={{ duration: 0.9 }}
            >
              <a
                href={item.productLink}
                className={cn(
                  'relative block h-120 max-w-67 overflow-hidden rounded-full px-6 pt-18 pb-0 text-center transition-all duration-300 hover:ring-2',
                  item.classNames,
                  {
                    'lg:mt-20': index % 2 === 0
                  }
                )}
              >
                <div className='flex flex-col items-center text-center'>
                  <div className='space-y-1'>
                    <h3 className='text-2xl font-semibold'>{item.title}</h3>
                    <p className='text-muted-foreground line-clamp-1 text-sm'>{item.description}</p>
                  </div>
                  <img src={item.img} alt={item.title} className={item.imageNames} />
                </div>
              </a>
            </MotionPreset>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
