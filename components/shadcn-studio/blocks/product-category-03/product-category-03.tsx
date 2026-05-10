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
              <CarouselItem key={`${item.title}-${index}`} className='pl-6 md:basis-1/3 lg:basis-1/6'>
                <a href={item.productLink}>
                  <div className='bg-muted mb-6 flex h-32 items-center justify-center rounded-md px-11.25'>
                    <img src={item.img} alt={item.title} className='h-22 object-contain' />
                  </div>
                  <h2 className='text-center text-lg font-medium'>{item.title}</h2>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            variant='default'
            className='disabled:bg-secondary disabled:text-primary absolute top-12 -left-3 size-9.5 translate-y-0 cursor-pointer rounded-full disabled:opacity-100'
          />
          <CarouselNext
            variant='default'
            className='disabled:bg-secondary disabled:text-primary absolute top-12 -right-3 size-9.5 translate-y-0 cursor-pointer rounded-full disabled:opacity-100'
          />
        </Carousel>
      </div>
    </section>
  )
}

export default ProductCategory
