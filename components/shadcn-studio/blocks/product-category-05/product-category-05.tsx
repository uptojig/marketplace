import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

type ProductCard = {
  img: string
  title: string
  productLink: string
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
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
          className='relative w-full px-6'
        >
          <CarouselContent className='-ml-6'>
            {productCards.map((item, index) => (
              <CarouselItem
                key={`${item.title}-${index}`}
                className='pl-6 min-[475px]:basis-1/2 md:basis-1/4 xl:basis-1/6'
              >
                <a href={item.productLink} className='flex flex-col items-center justify-center'>
                  <div className='hover:border-primary from-primary/25 to-muted/5 mb-6 flex size-35 items-center justify-center rounded-full bg-linear-to-b hover:border-2'>
                    <img src={item.img} alt={item.title} className='h-20 max-w-30 object-contain' />
                  </div>
                  <h2 className='text-center text-xl font-medium'>{item.title}</h2>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            variant='outline'
            className='absolute top-12 left-0 size-8.5 translate-y-0 cursor-pointer rounded-full disabled:opacity-100 md:-left-4'
          />
          <CarouselNext
            variant='outline'
            className='absolute top-12 right-0 size-8.5 translate-y-0 cursor-pointer rounded-full disabled:opacity-100 md:-right-4'
          />
        </Carousel>
      </div>
    </section>
  )
}

export default ProductCategory
