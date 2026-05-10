import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

type ProductCard = {
  img: string
  title: string
  buttonClass?: string
  productLink: string
  productNumber: number
  mainClass?: string
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex gap-6 max-sm:flex-col sm:mb-16 lg:mb-24'>
          <h2 className='grow text-2xl font-semibold md:text-3xl lg:text-4xl'>Our Popular Category</h2>
          <Button size='lg' className='w-fit rounded-lg text-base'>
            Explore All Category
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4'>
          {productCards.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={cn('relative w-full rounded-xl p-6 transition-all duration-300 hover:ring-1', item.mainClass)}
            >
              <div className='flex flex-col justify-between gap-6'>
                <div className='space-y-1'>
                  <h3 className='text-xl font-semibold'>{item.title}</h3>
                  <p className='text-muted-foreground font-medium'>{item.productNumber} Products</p>
                </div>
                <Button asChild className={item.buttonClass}>
                  <a href={item.productLink}>Shop Now</a>
                </Button>
              </div>
              <img
                src={item.img}
                alt={item.title}
                className='absolute end-0 bottom-0 z-0 h-46.5 w-auto object-contain'
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
