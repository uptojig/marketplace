import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { MotionPreset } from '@/components/ui/motion-preset'

type ProductCard = {
  icon: ReactNode
  title: string
  productNumber: number
  productLink: string
}[]

const ProductCategory = ({ productCards }: { productCards: ProductCard }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto flex max-w-7xl flex-col items-center space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='space-y-4 text-center'>
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} blur transition={{ duration: 0.5 }}>
            <Badge variant='outline' className='text-sm font-normal'>
              Category
            </Badge>
          </MotionPreset>
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} blur transition={{ duration: 0.5 }} delay={0.3}>
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Select a category to get started</h2>
          </MotionPreset>
        </div>
        <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {productCards.map((item, index) => (
            <MotionPreset
              key={item.title}
              fade
              blur
              slide={{ direction: 'down', offset: 15 }}
              transition={{ duration: 0.8 }}
              delay={0.6 + index * 0.15}
            >
              <a
                href={item.productLink}
                className='hover:ring-primary max-lg:focus:ring-primary bg-muted block w-full items-center rounded-md px-6 py-4 transition-all duration-300 hover:ring-2 max-lg:focus:ring-2'
              >
                <div className='flex items-center gap-6'>
                  {item.icon}
                  <Separator orientation='vertical' className='!h-12' />
                  <div className='space-y-1'>
                    <h3 className='text-2xl font-semibold'>{item.title}</h3>
                    <p className='text-muted-foreground text-lg'>{item.productNumber} Products Available</p>
                  </div>
                </div>
              </a>
            </MotionPreset>
          ))}
        </div>
        <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} transition={{ duration: 0.5 }} delay={1.5}>
          <Button size='lg' className='rounded-lg text-base'>
            Explore All Category
          </Button>
        </MotionPreset>
      </div>
    </section>
  )
}

export default ProductCategory
