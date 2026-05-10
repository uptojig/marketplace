import type { ReactNode } from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

type ProductCard = {
  img: string
  icon: ReactNode
  title: string
  productLink: string
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <p className='text-primary text-sm font-medium uppercase'>Category</p>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Shop By Category</h2>
          <p className='text-muted-foreground text-xl'>
            Explore our gallery to learn more about our amazing products and their features.
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start'
          }}
          className='relative w-full'
        >
          <CarouselContent className='-ml-6'>
            {productCards.map((item, index) => (
              <CarouselItem key={`${item.title}-${index}`} className='pl-6 sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                <a href={item.productLink} className='flex items-center justify-center'>
                  <div className='relative overflow-hidden rounded-md max-sm:max-w-72'>
                    <img src={item.img} alt={item.title} className='aspect-square size-full max-h-72 object-cover' />

                    <div className='absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-black/0 to-black/6 transition-opacity duration-500 group-hover:opacity-0'></div>
                    <div className='absolute start-6 end-6 bottom-6'>
                      <div className='bg-card rounded-md py-2.5 text-center'>
                        <div className='flex flex-col items-center gap-3'>
                          {item.icon}
                          <h3 className='text-2xl font-medium'>{item.title}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            variant='default'
            className='disabled:bg-secondary disabled:text-primary absolute top-1/2 left-2 size-9.5 -translate-y-1/2 cursor-pointer rounded-full disabled:opacity-100 sm:-left-5'
          />
          <CarouselNext
            variant='default'
            className='disabled:bg-secondary disabled:text-primary absolute top-1/2 right-2 size-9.5 -translate-y-1/2 cursor-pointer rounded-full disabled:opacity-100 sm:-right-5'
          />
        </Carousel>
      </div>
    </section>
  )
}

export default ProductCategory
