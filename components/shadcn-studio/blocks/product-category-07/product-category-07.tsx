import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ProductCard = {
  img: string
  title: string
  discountNumber?: number
  productLink: string
  productNumber: number
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex gap-6 max-sm:flex-col sm:mb-16 lg:mb-24'>
          <div className='grow space-y-4'>
            <p className='text-primary text-sm font-medium uppercase'>Category</p>
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Explore Popular Categories</h2>
          </div>
          <Button size='lg' className='w-fit rounded-lg text-base'>
            Explore All Category
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4'>
          {productCards.map((item, index) => (
            <a href={item.productLink} key={`${item.title}-${index}`}>
              <div className='bg-muted flex overflow-hidden rounded-md'>
                <div className='flex grow flex-col justify-between gap-4 p-6 pe-2'>
                  <div className='space-y-1'>
                    <h3 className='text-xl font-semibold'>{item.title}</h3>
                    <p className='text-muted-foreground'>{item.productNumber} Products</p>
                  </div>
                  <Badge variant='destructive' className='rounded-sm'>
                    {item.discountNumber}% off
                  </Badge>
                </div>
                <div className='w-27.5 shrink-0'>
                  <img src={item.img} alt={item.title} className='size-full rounded-s-md object-cover' />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
