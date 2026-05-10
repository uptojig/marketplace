import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'
import { TypewriterEffectCycling } from '@/components/ui/typewriter-effect'

import Circles from '@/components/shadcn-studio/blocks/bento-grid-14/circles'
import Generate from '@/components/shadcn-studio/blocks/bento-grid-14/generate'
import { CardStack } from '@/components/shadcn-studio/blocks/bento-grid-14/card-stack'
import type { StackProps } from '@/components/shadcn-studio/blocks/bento-grid-14/card-stack'

const BentoGrid = ({ images }: { images: StackProps['cardsData'] }) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-6 lg:px-8'>
        <MotionPreset
          fade
          blur
          slide={{ direction: 'down', offset: 75 }}
          transition={{ duration: 0.45 }}
          className='overflow-hidden md:col-span-3'
        >
          <Card className='h-full border-0 shadow-none'>
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.1}
              transition={{ duration: 0.45 }}
              className='flex-1 px-6'
            >
              <Generate>
                <TypewriterEffectCycling
                  words={[{ text: 'Make cards small', className: 'text-sm !text-foreground' }]}
                  typeSpeed={100}
                  deleteSpeed={50}
                  delayBetweenWords={10000}
                />
              </Generate>
            </MotionPreset>
            <CardHeader className='gap-4'>
              <MotionPreset
                component='h3'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.25}
                transition={{ duration: 0.45 }}
              >
                <CardTitle className='text-2xl font-semibold'>Build UI with AI Prompts</CardTitle>
              </MotionPreset>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.4} transition={{ duration: 0.45 }}>
                <CardDescription className='text-lg'>
                  Generate clean and functional UI instantly by describing your idea in plain words.
                </CardDescription>
              </MotionPreset>
            </CardHeader>
          </Card>
        </MotionPreset>

        <MotionPreset
          fade
          blur
          slide={{ direction: 'down', offset: 75 }}
          delay={0.2}
          transition={{ duration: 0.45 }}
          className='overflow-hidden md:col-span-3'
        >
          <Card className='h-full border-0 shadow-none'>
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.3}
              transition={{ duration: 0.45 }}
              className='flex h-75 justify-center overflow-hidden px-6'
            >
              <CardStack
                cardsData={images}
                perspective={3500}
                className='h-77.5 w-100 translate-y-17 focus-visible:outline-none [&>div>div]:h-77.5 [&>div>div]:w-100'
              />
            </MotionPreset>
            <CardHeader className='gap-4'>
              <MotionPreset
                component='h3'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.45}
                transition={{ duration: 0.45 }}
              >
                <CardTitle className='text-2xl font-semibold'>Customizable templates</CardTitle>
              </MotionPreset>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.6} transition={{ duration: 0.45 }}>
                <CardDescription className='text-lg'>
                  Start faster with ready-made layouts you can adapt, refine, and make uniquely yours.
                </CardDescription>
              </MotionPreset>
            </CardHeader>
          </Card>
        </MotionPreset>

        <MotionPreset
          fade
          blur
          slide={{ direction: 'down', offset: 75 }}
          delay={0.4}
          transition={{ duration: 0.45 }}
          className='overflow-hidden md:col-span-3 lg:col-span-2'
        >
          <Card className='h-full justify-between overflow-hidden border-0 shadow-none'>
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.5}
              transition={{ duration: 0.45 }}
              className='relative flex h-70 items-center justify-center overflow-hidden'
            >
              <div className='grid grid-cols-1'>
                {/* Row 1 */}
                <Marquee
                  gap={1.25}
                  className='py-2 [&>div]:[animation-play-state:running] group-hover/palette:[&>div]:[animation-play-state:paused]'
                >
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='size-7 shrink-0 rounded-md border bg-amber-600 dark:bg-amber-400' />
                    <span className='text-lg font-medium'>Warning</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-chart-2 size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Chart-2</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-secondary-foreground size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Secondary foreground</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-chart-3 size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Chart-3</span>
                  </span>
                </Marquee>
                {/* Row 2 */}
                <Marquee
                  gap={1.25}
                  duration={30}
                  reverse
                  className='py-2 [&>div]:[animation-play-state:running] group-hover/palette:[&>div]:[animation-play-state:paused]'
                >
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-card-foreground size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Card foreground</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-destructive size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Destructive</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-background size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Background</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='size-7 shrink-0 rounded-md border bg-sky-600 dark:bg-sky-400' />
                    <span className='text-lg font-medium'>Info</span>
                  </span>
                </Marquee>
                {/* Row 3 */}
                <Marquee
                  gap={1.25}
                  duration={35}
                  className='py-2 [&>div]:[animation-play-state:running] group-hover/palette:[&>div]:[animation-play-state:paused]'
                >
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-chart-5 size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Chart-5</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-secondary size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Secondary</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='size-7 shrink-0 rounded-md border bg-green-600 dark:bg-green-400' />
                    <span className='text-lg font-medium'>Success</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-primary size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Primary</span>
                  </span>
                </Marquee>
                {/* Row 4 */}
                <Marquee
                  gap={1.25}
                  reverse
                  className='py-2 [&>div]:[animation-play-state:running] group-hover/palette:[&>div]:[animation-play-state:paused]'
                >
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-chart-4 size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Chart-4</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-primary-foreground size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Primary foreground</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-foreground size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Foreground</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-card size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Card</span>
                  </span>
                </Marquee>
                {/* Row 5 */}
                <Marquee
                  gap={1.25}
                  duration={32}
                  className='py-2 [&>div]:[animation-play-state:running] group-hover/palette:[&>div]:[animation-play-state:paused]'
                >
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-muted-foreground size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Muted foreground</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-accent size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Accent</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-chart-1 size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Chart-1</span>
                  </span>
                  <span className='flex items-center gap-2 rounded-md border p-2'>
                    <span className='bg-muted size-7 shrink-0 rounded-md border' />
                    <span className='text-lg font-medium'>Muted</span>
                  </span>
                </Marquee>
              </div>
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(transparent_20%,var(--card)_80%)]' />
            </MotionPreset>
            <CardHeader className='gap-4'>
              <MotionPreset
                component='h3'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.65}
                transition={{ duration: 0.45 }}
              >
                <CardTitle className='text-2xl font-semibold'>Smart design tokens</CardTitle>
              </MotionPreset>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={0.8} transition={{ duration: 0.45 }}>
                <CardDescription className='text-lg'>
                  Manage colors, typography, and spacing consistently across every project with one system.
                </CardDescription>
              </MotionPreset>
            </CardHeader>
          </Card>
        </MotionPreset>

        <MotionPreset
          fade
          blur
          slide={{ direction: 'down', offset: 75 }}
          delay={0.6}
          transition={{ duration: 0.45 }}
          className='overflow-hidden md:col-span-3 lg:col-span-2'
        >
          <Card className='h-full border-0 shadow-none'>
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.7}
              transition={{ duration: 0.45 }}
              className='flex justify-center px-6'
            >
              <Circles />
            </MotionPreset>
            <CardHeader className='gap-4'>
              <MotionPreset
                component='h3'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={0.85}
                transition={{ duration: 0.45 }}
              >
                <CardTitle className='text-2xl font-semibold'>Best technologies</CardTitle>
              </MotionPreset>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={1} transition={{ duration: 0.45 }}>
                <CardDescription className='text-lg'>
                  Experience faster workflows and smoother performance, built with the best web technologies.
                </CardDescription>
              </MotionPreset>
            </CardHeader>
          </Card>
        </MotionPreset>

        <MotionPreset
          fade
          blur
          slide={{ direction: 'down', offset: 75 }}
          delay={0.8}
          transition={{ duration: 0.45 }}
          className='overflow-hidden md:col-span-full lg:col-span-2'
        >
          <Card className='group h-full border-0 shadow-none'>
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 50 }}
              delay={0.9}
              transition={{ duration: 0.45 }}
              className='relative flex min-h-75 flex-1 items-end overflow-hidden px-3.5'
            >
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-62.png'
                alt='Dashboard'
                className='w-full origin-bottom translate-x-3.5 scale-105 rounded-t-md border border-b-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 max-lg:translate-x-5 max-lg:translate-y-8.5 dark:hidden'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-62-dark.png'
                alt='Dashboard'
                className='hidden origin-bottom translate-x-3.5 scale-105 rounded-t-md border border-b-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 max-lg:translate-x-5 max-lg:translate-y-8.5 dark:inline-block'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-63.png'
                alt='Dashboard'
                className='absolute top-20 right-3.5 w-[35%] transition-all duration-500 group-hover:top-full dark:hidden'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-63-dark.png'
                alt='Dashboard'
                className='absolute top-20 right-3.5 hidden w-[35%] transition-all duration-500 group-hover:top-full dark:inline-block'
              />
              <div className='from-card pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent' />
            </MotionPreset>
            <CardHeader className='gap-4'>
              <MotionPreset
                component='h3'
                fade
                slide={{ direction: 'down', offset: 50 }}
                delay={1.05}
                transition={{ duration: 0.45 }}
              >
                <CardTitle className='text-2xl font-semibold'>Responsive by default</CardTitle>
              </MotionPreset>
              <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={1.2} transition={{ duration: 0.45 }}>
                <CardDescription className='text-lg'>
                  Every component adapts to any screen, delivering pixel-perfect design on all devices.
                </CardDescription>
              </MotionPreset>
            </CardHeader>
          </Card>
        </MotionPreset>
      </div>
    </section>
  )
}

export default BentoGrid
