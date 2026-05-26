import ProductCard3D, { type ProductCard } from '@/components/shadcn-studio/blocks/product-category-08/card-effect'

import { Button } from '@/components/ui/button'

const ProductCategory = ({ productCards, selectedCats, storeSlug }: { productCards: ProductCard, selectedCats?: string[], storeSlug?: string }) => {
  const categoryTitle = selectedCats && selectedCats.length > 0 ? selectedCats[0] : 'สำรวจสินค้าทั้งหมดของเรา';
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 flex gap-6 max-md:flex-col items-center justify-between'>
          <div className='grow space-y-2'>
            <p className='text-[#f97316] text-sm font-medium uppercase tracking-wider font-[family:var(--font-prompt)]'>หมวดหมู่สินค้า</p>
            <h2 className='text-3xl font-bold md:text-4xl lg:text-5xl font-[family:var(--font-kanit)] text-[#7c2d12]'>
              {categoryTitle}
            </h2>
          </div>
          <Button size='lg' asChild className='w-fit rounded-lg text-base bg-[#e67e22] hover:bg-[#d35400] text-white font-[family:var(--font-prompt)]'>
            <a href={`/stores/${storeSlug || 'zugarbox'}/category`}>ดูหมวดหมู่ทั้งหมด</a>
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
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
