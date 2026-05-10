import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ProductCard = {
  img: string
  badge?: string
  title: string
  productNumber: number
  productLink: string
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex flex-col items-center space-y-12 sm:space-y-16 lg:space-y-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Popular Categories</h2>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {productCards.map(item => (
              <div className='relative h-full min-h-165 overflow-hidden' key={item.title}>
                <img src={item.img} alt={item.title} className='size-full object-cover' />
                <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black/30'></div>
                {item.badge && (
                  <Badge variant='destructive' className='absolute start-6 top-6 rounded-sm px-3 py-1'>
                    {item.badge}
                  </Badge>
                )}
                <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black/40' />
                <div className='absolute start-6 bottom-6'>
                  <h3 className='mb-1 text-2xl font-bold text-white'>{item.title}</h3>
                  <p className='mb-6 text-white'>{item.productNumber} Products</p>
                  <Button
                    asChild
                    className='bg-green-600 text-white hover:bg-green-600/90 focus-visible:ring-green-600/20 dark:bg-green-400/60 dark:hover:bg-green-400/90 dark:focus-visible:ring-green-400/40'
                  >
                    <a href={item.productLink}>Shop Now</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className='h-12 rounded-lg px-6 py-0 text-base'>Explore All Category</Button>
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
