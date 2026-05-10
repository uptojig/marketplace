import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ProductCard = {
  img: string
  misc: string
  badge: string
  title: string
  mainClass?: string
  imgClass?: string
  contextClass?: string
  productLink: string
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <p className='text-primary text-sm font-medium uppercase'>Category</p>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
            Shop By <span className='border-primary border-b-1'>Category</span>
          </h2>
          <p className='text-muted-foreground text-xl'>
            Explore our gallery to learn more about our amazing products and their features.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {productCards.map(item => (
            <div key={item.title} className={cn('relative rounded-lg p-6', item.mainClass)}>
              <div className={cn('space-y-3', item.contextClass)}>
                <div className='space-y-1.5'>
                  <Badge variant='destructive' className='rounded-sm px-3 py-1 capitalize'>
                    {item.badge}
                  </Badge>
                  <p className='text-2xl font-bold text-white capitalize'>{item.misc}</p>
                  <p className='text-4xl font-bold text-white uppercase'>{item.title}</p>
                </div>
                <Button asChild variant='secondary' className='w-fit border-0'>
                  <a href={item.productLink}>Browse</a>
                </Button>
              </div>
              <div className={item.imgClass}>
                <img src={item.img} alt={item.title} className='size-full object-contain' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
