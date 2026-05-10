import { Card, CardContent } from '@/components/ui/card'
import ProductCarousel from '@/components/shadcn-studio/blocks/product-list-05/carousal'

export type ProductItem = {
  productImages: string[]
  name: string
  price: number
  salePrice?: number
  category: string
}

type ProductProps = {
  products: ProductItem[]
}

const ProductList = ({ products }: ProductProps) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='space-y-4 text-center'>
          <p className='text-sm font-medium uppercase'>Blazers For Men</p>
          <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>All New Collection</h2>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Product Cards */}
          {products.map((product, index) => (
            <Card key={index} className='group gap-0 py-0 shadow-none transition-all duration-300'>
              <ProductCarousel productImages={product.productImages} />
              <CardContent className='z-10 flex flex-col gap-1 py-6'>
                <div className='flex items-center justify-between font-semibold'>
                  <h3 className='text-lg'>{product.name}</h3>
                  <span className='text-2xl'>${product.salePrice ? product.salePrice : product.price}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>{product.category}</span>
                  {product.salePrice && (
                    <div className='flex items-center justify-between gap-2'>
                      <span className='line-through'>${product.price}</span>
                      <span className='text-sm text-green-600 dark:text-green-400'>
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductList
