import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WobbleCard } from '@/components/ui/wobble-card'
import { Badge } from '@/components/ui/badge'

const ProductCategory = () => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex gap-6 max-sm:flex-col sm:mb-16 lg:mb-24'>
          <h2 className='grow text-2xl font-semibold md:text-3xl lg:text-4xl'>Popular Categories</h2>
          <Button size='lg' className='w-fit rounded-lg text-base'>
            Explore All Category
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <WobbleCard containerClassName='rounded-xl md:row-span-2 lg:col-span-2 h-full'>
            <Card className='h-full border-0 bg-[url(https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-39.png)] bg-cover shadow-none'>
              <CardContent className='flex grow justify-between'>
                <div className='flex shrink-0'>
                  <Badge className='h-fit rounded-sm bg-green-600 text-black dark:bg-green-400/40 dark:text-white'>
                    New Arrival
                  </Badge>
                </div>
                <div className='flex h-full flex-col items-end justify-between gap-15'>
                  <div className='space-y-1.5 text-end'>
                    <h3 className='text-2xl font-semibold'>Be Fashion Forward</h3>
                    <p className='text-black dark:text-white'>4555 Products</p>
                  </div>
                  <Button asChild className='w-fit rounded-lg text-base'>
                    <a href='#'>Shop Now</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </WobbleCard>
          <WobbleCard containerClassName='rounded-xl'>
            <Card className='border-0 bg-[url(https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-37.png)] bg-cover shadow-none'>
              <CardContent className='grow justify-between sm:flex-row'>
                <div className='flex h-full flex-col gap-1.5'>
                  <h3 className='text-2xl font-semibold'>Watch</h3>
                  <p className='text-black dark:text-white'>478 Products</p>
                  <Button asChild className='w-fit rounded-lg text-base'>
                    <a href='#'>Shop Now</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </WobbleCard>
          <WobbleCard containerClassName='rounded-xl'>
            <Card className='border-0 bg-[url(https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-36.png)] bg-cover shadow-none'>
              <CardContent className='grow justify-between sm:flex-row'>
                <div className='flex h-full flex-col gap-1.5'>
                  <h3 className='text-2xl font-semibold'>Shoes</h3>
                  <p className='text-black dark:text-white'>654 Products</p>
                  <Button asChild className='w-fit rounded-lg text-base'>
                    <a href='#'>Shop Now</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </WobbleCard>
          <WobbleCard containerClassName='rounded-xl md:col-span-2'>
            <Card className='border-0 bg-[url(https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-38.png)] bg-cover shadow-none'>
              <CardContent className='grow justify-between sm:flex-row'>
                <div className='flex h-full flex-col gap-1.5'>
                  <h3 className='text-2xl font-semibold'>Accessories</h3>
                  <p className='text-black dark:text-white'>452 Products</p>
                  <Button asChild className='w-fit rounded-lg text-base'>
                    <a href='#'>Shop Now</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </WobbleCard>
        </div>
      </div>
    </section>
  )
}

export default ProductCategory
