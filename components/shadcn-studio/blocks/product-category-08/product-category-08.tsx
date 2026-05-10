import ProductCard3D, { type ProductCard } from '@/components/shadcn-studio/blocks/product-category-08/card-effect'

import { Button } from '@/components/ui/button'

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-36 flex gap-6 max-md:flex-col'>
          <div className='grow space-y-4'>
            <p className='text-primary text-sm font-medium uppercase'>Category</p>
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Explore Popular Categories</h2>
          </div>
          <Button size='lg' className='w-fit rounded-lg text-base'>
            Explore All Category
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-x-6 gap-y-32 sm:grid-cols-2 lg:grid-cols-3'>
          {productCards.map((item, index) => (
            <ProductCard3D key={`${item.title}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
export type { ProductCard }
