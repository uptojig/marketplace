import { ArrowUpRightIcon, GlobeIcon, SearchIcon, StarIcon, TrendingUpIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MotionPreset } from '@/components/ui/motion-preset'

import SortByDropdownMenu from '@/components/shadcn-studio/blocks/bento-grid-09/sort-by-dropdown-menu'
import ProductCard from '@/components/shadcn-studio/blocks/bento-grid-09/product-card'
import type { ProductCardProps } from '@/components/shadcn-studio/blocks/bento-grid-09/product-card'

export type BentoGridProps = {
  all: {
    products: ProductCardProps[]
  }
  trending: {
    products: ProductCardProps[]
  }
  bestReviews: {
    products: ProductCardProps[]
  }
}

const BentoGrid = ({ all, trending, bestReviews }: BentoGridProps) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        {/* Header Section */}
        <div className='flex flex-col items-center gap-4 text-center'>
          <MotionPreset
            component='h2'
            fade
            slide={{ direction: 'down', offset: 50 }}
            transition={{ duration: 0.5 }}
            className='text-2xl font-semibold sm:text-3xl lg:text-4xl'
          >
            Explore
          </MotionPreset>

          <MotionPreset
            component='p'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.15}
            transition={{ duration: 0.5 }}
            className='text-muted-foreground max-w-200 text-xl'
          >
            Discover curated fashion pieces, timeless essentials, and trend-driven styles designed to elevate your
            everyday wardrobe.
          </MotionPreset>
        </div>

        <Tabs defaultValue='all' className='gap-10'>
          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.3}
            transition={{ duration: 0.5 }}
            className='flex items-center justify-between gap-6'
          >
            <TabsList className='bg-muted h-11.5 gap-3 rounded-full group-data-[orientation=horizontal]/tabs:h-11.5'>
              <TabsTrigger
                value='all'
                className='bg-primary/10 hover:bg-primary/20 data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground text-primary dark:text-primary h-full cursor-pointer gap-2 rounded-full px-4 py-2.5 transition-colors duration-300 sm:px-6 dark:data-[state=active]:border-transparent'
              >
                <GlobeIcon />
                <span className='max-sm:sr-only'>All</span>
              </TabsTrigger>

              <TabsTrigger
                value='trending'
                className='bg-primary/10 hover:bg-primary/20 data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground text-primary dark:text-primary h-full cursor-pointer gap-2 rounded-full px-4 py-2.5 transition-colors duration-300 sm:px-6 dark:data-[state=active]:border-transparent'
              >
                <TrendingUpIcon />
                <span className='max-sm:sr-only'>Trending</span>
              </TabsTrigger>

              <TabsTrigger
                value='best-reviews'
                className='bg-primary/10 hover:bg-primary/20 data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground text-primary dark:text-primary h-full cursor-pointer gap-2 rounded-full px-4 py-2.5 transition-colors duration-300 sm:px-6 dark:data-[state=active]:border-transparent'
              >
                <StarIcon />
                <span className='max-sm:sr-only'>Best Reviews</span>
              </TabsTrigger>
            </TabsList>

            <div className='flex gap-3'>
              <SortByDropdownMenu />
              <Button
                size='icon-sm'
                className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 rounded-full'
              >
                <SearchIcon />
                <span className='sr-only'>Search</span>
              </Button>
            </div>
          </MotionPreset>

          <TabsContent value='all' className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex flex-col gap-6'>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
                className='relative grid h-43 place-content-center overflow-hidden rounded-xl bg-green-600/10 p-6 dark:bg-green-400/10'
              >
                <div className='group absolute inset-y-0 left-0 w-1/2 max-lg:hidden'>
                  <img
                    src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-31.png'
                    alt='Fashion Left'
                    className='absolute bottom-0 left-0 w-1/2 transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
                <div className='flex flex-col items-center gap-4'>
                  <h3 className='z-10 text-xl font-medium sm:text-2xl lg:text-3xl'>Get upto 60% off</h3>
                  <Button size='lg' className='bg-card text-card-foreground hover:bg-card/90 z-10 rounded-full' asChild>
                    <a href='#'>Get discount</a>
                  </Button>
                </div>
                <div className='group absolute inset-y-0 right-0 w-1/2 max-lg:hidden'>
                  <img
                    src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-30.png'
                    alt='Fashion Right'
                    className='absolute right-2 bottom-0 w-2/3 transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
              </MotionPreset>

              <MotionPreset
                component='a'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.35}
                transition={{ duration: 0.5 }}
                motionProps={{
                  href: '#'
                }}
                className='group relative flex h-43 items-center overflow-hidden rounded-xl bg-amber-600/10 p-6 max-lg:justify-center dark:bg-amber-400/10'
              >
                <div className='flex flex-col gap-1 max-lg:items-center'>
                  <h3 className='text-xl font-medium sm:text-2xl lg:text-3xl'>Summer&rsquo;s weekend</h3>
                  <p className='text-muted-foreground text-lg'>Keep it casual</p>
                </div>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-29.png'
                  alt='Summer Fashion'
                  className='absolute right-0 bottom-0 w-[35%] max-w-52 transition-transform duration-300 group-hover:scale-105 max-lg:hidden'
                />
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='bg-background! hover:bg-background/90 pointer-events-none absolute top-4.5 right-4.5 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
                >
                  <ArrowUpRightIcon />
                  <span className='sr-only'>Explore</span>
                </Button>
              </MotionPreset>

              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.4}
                transition={{ duration: 0.5 }}
                className='grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2'
              >
                <div className='group relative h-full overflow-hidden rounded-xl'>
                  <img
                    src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-28.png'
                    alt='Avail Offers'
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  <Button
                    size='lg'
                    className='bg-card text-card-foreground hover:bg-card/90 absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full'
                    asChild
                  >
                    <a href='#'>Avail offers</a>
                  </Button>
                </div>

                <Carousel
                  opts={{
                    align: 'start',
                    slidesToScroll: 1
                  }}
                  className='h-full'
                >
                  <Card className='h-full gap-4 border-0 py-4 shadow-none'>
                    <CardHeader className='gap-0'>
                      <div className='flex items-center justify-between gap-2 rounded-full bg-amber-600/20 px-4 py-3 dark:bg-amber-400/20'>
                        <span className='text-lg'>Favorites</span>
                        <div className='flex gap-2'>
                          <CarouselPrevious variant='ghost' className='static size-7 translate-y-0' />
                          <CarouselNext variant='ghost' className='static size-7 translate-y-0' />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className='flex-1'>
                      <div className='h-full rounded-xl bg-amber-600/20 dark:bg-amber-400/20 [&_[data-slot=carousel-content]]:h-full'>
                        <CarouselContent className='ml-0 h-full'>
                          <CarouselItem className='grid grid-cols-2 gap-2 p-3'>
                            <div className='group flex items-end overflow-hidden rounded-lg bg-amber-600/50 dark:bg-amber-400/50'>
                              <img
                                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-24.png'
                                alt='Fashion Men'
                                className='w-full object-contain transition-transform duration-300 group-hover:scale-105'
                              />
                            </div>

                            <div className='flex flex-col gap-2'>
                              <div className='group flex flex-1 items-end overflow-hidden rounded-lg bg-amber-600/50 dark:bg-amber-400/50'>
                                <img
                                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-23.png'
                                  alt='Fashion Women'
                                  className='w-full object-contain transition-transform duration-300 group-hover:scale-105'
                                />
                              </div>
                              <Button
                                size='lg'
                                className='bg-card text-card-foreground hover:bg-card/90 rounded-full'
                                asChild
                              >
                                <a href='#'>See all</a>
                              </Button>
                            </div>
                          </CarouselItem>
                          <CarouselItem className='grid grid-cols-2 gap-2 p-3'>
                            <div className='group flex items-end overflow-hidden rounded-lg bg-amber-600/50 dark:bg-amber-400/50'>
                              <img
                                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-22.png'
                                alt='Fashion Men'
                                className='w-full object-contain transition-transform duration-300 group-hover:scale-105'
                              />
                            </div>

                            <div className='flex flex-col gap-2'>
                              <div className='group flex flex-1 items-end overflow-hidden rounded-lg bg-amber-600/50 dark:bg-amber-400/50'>
                                <img
                                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-21.png'
                                  alt='Fashion Women'
                                  className='w-full object-contain transition-transform duration-300 group-hover:scale-105'
                                />
                              </div>
                              <Button
                                size='lg'
                                className='bg-card text-card-foreground hover:bg-card/90 rounded-full'
                                asChild
                              >
                                <a href='#'>See all</a>
                              </Button>
                            </div>
                          </CarouselItem>
                          <CarouselItem className='grid grid-cols-2 gap-2 p-3'>
                            <div className='group flex items-end overflow-hidden rounded-lg bg-amber-600/50 dark:bg-amber-400/50'>
                              <img
                                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-20.png'
                                alt='Fashion Men'
                                className='w-full object-contain transition-transform duration-300 group-hover:scale-105'
                              />
                            </div>

                            <div className='flex flex-col gap-2'>
                              <div className='group flex flex-1 items-end overflow-hidden rounded-lg bg-amber-600/50 dark:bg-amber-400/50'>
                                <img
                                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-19.png'
                                  alt='Fashion Women'
                                  className='w-full object-contain transition-transform duration-300 group-hover:scale-105'
                                />
                              </div>
                              <Button
                                size='lg'
                                className='bg-card text-card-foreground hover:bg-card/90 rounded-full'
                                asChild
                              >
                                <a href='#'>See all</a>
                              </Button>
                            </div>
                          </CarouselItem>
                        </CarouselContent>
                      </div>
                    </CardContent>
                  </Card>
                </Carousel>
              </MotionPreset>
            </div>

            <div className='flex flex-col gap-6'>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.45}
                transition={{ duration: 0.5 }}
                className='grid grid-cols-1 gap-6 lg:grid-cols-2'
              >
                {all.products.slice(0, 2).map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </MotionPreset>
              <MotionPreset
                component='a'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.5}
                transition={{ duration: 0.5 }}
                motionProps={{
                  href: '#'
                }}
                className='group relative flex h-full min-h-43 items-center overflow-hidden rounded-xl bg-sky-600/20 p-6 max-lg:justify-center sm:min-h-59 dark:bg-sky-400/20'
              >
                <div className='flex flex-col gap-1 max-lg:items-center'>
                  <h3 className='text-xl font-medium sm:text-2xl lg:text-3xl'>Bring bold fashion</h3>
                  <p className='text-muted-foreground text-lg'>Layers on layers</p>
                </div>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-27.png'
                  alt='Bold Fashion'
                  className='absolute right-8 bottom-0 h-full transition-transform duration-300 group-hover:scale-105 max-lg:hidden'
                />
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='bg-background! hover:bg-background/90 pointer-events-none absolute top-4.5 right-4.5 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
                >
                  <ArrowUpRightIcon />
                  <span className='sr-only'>Explore</span>
                </Button>
              </MotionPreset>
            </div>
          </TabsContent>

          <TabsContent value='trending' className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex flex-col gap-6'>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
                className='grid grid-cols-1 gap-6 lg:grid-cols-2'
              >
                {trending.products.slice(0, 2).map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </MotionPreset>
              <MotionPreset
                component='a'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.35}
                transition={{ duration: 0.5 }}
                motionProps={{
                  href: '#'
                }}
                className='group relative flex h-full min-h-43 items-center overflow-hidden rounded-xl bg-amber-600/10 p-6 max-lg:justify-center sm:min-h-59 dark:bg-amber-400/10'
              >
                <div className='flex flex-col gap-1 max-lg:items-center'>
                  <h3 className='text-xl font-medium sm:text-2xl lg:text-3xl'>Summer&rsquo;s weekend</h3>
                  <p className='text-muted-foreground text-lg'>Keep it casual</p>
                </div>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-29.png'
                  alt='Summer Fashion'
                  className='absolute -right-3 bottom-0 w-[42%] max-w-65 transition-transform duration-300 group-hover:scale-105 max-lg:hidden'
                />
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='bg-background! hover:bg-background/90 pointer-events-none absolute top-4.5 right-4.5 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
                >
                  <ArrowUpRightIcon />
                  <span className='sr-only'>Explore</span>
                </Button>
              </MotionPreset>
            </div>

            <div className='flex flex-col gap-6'>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.4}
                transition={{ duration: 0.5 }}
                className='grid grid-cols-1 gap-6 lg:grid-cols-2'
              >
                {trending.products.slice(2, 4).map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </MotionPreset>
              <MotionPreset
                component='a'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.45}
                transition={{ duration: 0.5 }}
                motionProps={{
                  href: '#'
                }}
                className='group relative flex h-full min-h-43 items-center overflow-hidden rounded-xl bg-sky-600/20 p-6 max-lg:justify-center sm:min-h-59 dark:bg-sky-400/20'
              >
                <div className='flex flex-col gap-1 max-lg:items-center'>
                  <h3 className='text-xl font-medium sm:text-2xl lg:text-3xl'>Bring bold fashion</h3>
                  <p className='text-muted-foreground text-lg'>Layers on layers</p>
                </div>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-27.png'
                  alt='Bold Fashion'
                  className='absolute right-8 bottom-0 h-full transition-transform duration-300 group-hover:scale-105 max-lg:hidden'
                />
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='bg-background! hover:bg-background/90 pointer-events-none absolute top-4.5 right-4.5 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
                >
                  <ArrowUpRightIcon />
                  <span className='sr-only'>Explore</span>
                </Button>
              </MotionPreset>
            </div>
          </TabsContent>

          <TabsContent value='best-reviews' className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex flex-col gap-6'>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
                className='grid grid-cols-1 gap-6 lg:grid-cols-2'
              >
                {bestReviews.products.slice(0, 2).map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </MotionPreset>
              <MotionPreset
                component='a'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.35}
                transition={{ duration: 0.5 }}
                motionProps={{
                  href: '#'
                }}
                className='group relative flex h-full min-h-43 items-center overflow-hidden rounded-xl bg-amber-600/10 p-6 max-lg:justify-center sm:min-h-59 dark:bg-amber-400/10'
              >
                <div className='flex flex-col gap-1 max-lg:items-center'>
                  <h3 className='text-xl font-medium sm:text-2xl lg:text-3xl'>Best sun glasses</h3>
                  <p className='text-muted-foreground text-lg'>Keep it casual</p>
                </div>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-39.png'
                  alt='Sun Glasses'
                  className='absolute right-3 bottom-0 w-[38%] max-w-56.5 transition-transform duration-300 group-hover:scale-105 max-lg:hidden'
                />
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='bg-background! hover:bg-background/90 pointer-events-none absolute top-4.5 right-4.5 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
                >
                  <ArrowUpRightIcon />
                  <span className='sr-only'>Explore</span>
                </Button>
              </MotionPreset>
            </div>

            <div className='flex flex-col gap-6'>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.4}
                transition={{ duration: 0.5 }}
                className='grid grid-cols-1 gap-6 lg:grid-cols-2'
              >
                {bestReviews.products.slice(2, 4).map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </MotionPreset>
              <MotionPreset
                component='a'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.45}
                transition={{ duration: 0.5 }}
                motionProps={{
                  href: '#'
                }}
                className='group relative flex h-full min-h-43 items-center overflow-hidden rounded-xl bg-sky-600/20 p-6 max-lg:justify-center sm:min-h-59 dark:bg-sky-400/20'
              >
                <div className='flex flex-col gap-1 max-lg:items-center'>
                  <h3 className='text-xl font-medium sm:text-2xl lg:text-3xl'>Most loved caps</h3>
                  <p className='text-muted-foreground text-lg'>Layers on layers</p>
                </div>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-38.png'
                  alt='Caps'
                  className='absolute right-3 bottom-0 w-[42%] max-w-62.5 transition-transform duration-300 group-hover:scale-105 max-lg:hidden'
                />
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='bg-background! hover:bg-background/90 pointer-events-none absolute top-4.5 right-4.5 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
                >
                  <ArrowUpRightIcon />
                  <span className='sr-only'>Explore</span>
                </Button>
              </MotionPreset>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export default BentoGrid
