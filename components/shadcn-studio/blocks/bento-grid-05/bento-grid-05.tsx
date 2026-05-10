import { StarIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import CircleSVG from '@/components/shadcn-studio/blocks/bento-grid-05/circle-svg'
import RippleBg from '@/components/shadcn-studio/blocks/bento-grid-05/ripple-bg'

import Logo from '@/assets/svg/logo'
import LogoVector from '@/assets/svg/logo-vector'

const BentoGrid = () => {
  return (
    <section className='bg-neutral-950 py-8 text-white sm:py-16 lg:py-24'>
      <div className='mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8'>
        {/* Card 1 */}
        <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} transition={{ duration: 0.5 }}>
          <Card className='h-full border-0 bg-gradient-to-br from-neutral-900 to-neutral-700'>
            <CardContent className='flex h-full flex-col justify-between gap-6'>
              <div className='space-y-4'>
                <LogoVector className='size-10.5 text-white' />
                <h3 className='text-3xl font-semibold text-neutral-100'>Effortless UI Building with shadcn/studio</h3>
              </div>

              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-10.png'
                alt='Components Mockup'
                className='mx-auto h-auto w-45 rounded object-contain'
              />
            </CardContent>
          </Card>
        </MotionPreset>

        {/* Card 2 */}
        <MotionPreset
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={0.3}
          transition={{ duration: 0.5 }}
          className='z-1 lg:col-span-2'
        >
          <Card className='relative h-full border-0 bg-radial-[at_50%_110%] from-white to-neutral-800 to-75%'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-14.png'
              alt='Noise'
              className='pointer-events-none absolute inset-0 size-full rounded-xl bg-gradient-to-b from-neutral-900/90 from-20% to-neutral-300/20 object-cover select-none'
            />

            <CardContent className='z-1'>
              <h2 className='text-center text-5xl leading-15.5 font-semibold text-neutral-100'>
                Beautiful Shadcn UI Components & Examples ✨
              </h2>
            </CardContent>

            {/* Center Logo */}
            <MotionPreset
              fade
              blur
              zoom={{ initialScale: 0.75 }}
              delay={1}
              transition={{ duration: 0.5 }}
              className='absolute bottom-0 left-1/2 z-10 flex size-62 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-black p-8 max-lg:hidden'
            >
              <svg
                height='206'
                width='206'
                xmlns='http://www.w3.org/2000/svg'
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 animate-ping [animation-delay:3s]'
              >
                <circle r='89' cx='103' cy='103' stroke='white' strokeOpacity='0.4' strokeWidth='2' fill='none' />
                <circle r='77' cx='103' cy='103' stroke='white' strokeOpacity='0.7' strokeWidth='2' fill='none' />
                <circle r='65' cx='103' cy='103' stroke='white' strokeOpacity='1' strokeWidth='2' fill='none' />
              </svg>
              <CircleSVG />
              <Logo className='z-1 size-36' />
            </MotionPreset>
          </Card>
        </MotionPreset>

        <div className='flex flex-col gap-7'>
          {/* Card 3 */}
          <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} delay={0.6} transition={{ duration: 0.5 }}>
            <Card className='border-0 bg-gradient-to-l from-neutral-900 to-neutral-700'>
              <CardContent className='flex flex-col items-center justify-center gap-4'>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-11.png'
                  alt='GitHub'
                  className='size-14'
                />

                <div className='flex gap-1 rounded-lg border border-white p-1'>
                  <Button size='sm' className='bg-white text-black hover:bg-white/90' asChild>
                    <a href='#'>
                      <StarIcon />
                      Star
                    </a>
                  </Button>
                  <Button size='sm' variant='ghost' className='text-white! hover:bg-white/10!' asChild>
                    <a href='#'>1.6K</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionPreset>

          {/* Card 4 */}
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 15 }}
            delay={0.7}
            transition={{ duration: 0.5 }}
            className='h-full'
          >
            <Card className='relative h-full min-h-60 border-0 bg-gradient-to-br from-neutral-900 to-neutral-700'>
              <RippleBg className='absolute inset-0 size-full text-neutral-200' />
              <CardContent className='relative z-10 flex h-full flex-col items-center justify-center text-center'>
                <h3 className='text-6xl leading-19.5 font-semibold text-neutral-100'>50K+</h3>
                <p className='text-xl font-medium text-neutral-300'>Downloads</p>
              </CardContent>
            </Card>
          </MotionPreset>
        </div>

        <div className='flex flex-col gap-7'>
          {/* Card 5 */}
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 15 }}
            delay={0.1}
            transition={{ duration: 0.5 }}
            className='h-full'
          >
            <Card className='relative h-full min-h-60 border-0 bg-gradient-to-br from-neutral-900 to-neutral-700'>
              <RippleBg className='pointer-events-none absolute inset-0 size-full text-[#E3E3E3] select-none' />

              <CardContent className='flex h-full flex-col items-center justify-between gap-6 text-center'>
                <div>
                  <h3 className='text-6xl leading-19.5 font-semibold text-neutral-100'>15K+</h3>
                  <p className='text-xl font-medium text-neutral-300'>Happy Developers</p>
                </div>

                <div className='flex -space-x-4'>
                  <Avatar className='size-11 ring-2 ring-black'>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' alt='avatar-1' />
                    <AvatarFallback>A1</AvatarFallback>
                  </Avatar>
                  <Avatar className='size-11 ring-2 ring-black'>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png' alt='avatar-2' />
                    <AvatarFallback>A2</AvatarFallback>
                  </Avatar>
                  <Avatar className='size-11 ring-2 ring-black'>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png' alt='avatar-3' />
                    <AvatarFallback>A3</AvatarFallback>
                  </Avatar>
                  <Avatar className='size-11 ring-2 ring-black'>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png' alt='avatar-4' />
                    <AvatarFallback>A4</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </MotionPreset>

          {/* Card 6 */}
          <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} delay={0.2} transition={{ duration: 0.5 }}>
            <Card className='relative h-full min-h-38 items-center justify-center border-0 bg-gradient-to-br from-neutral-900 to-neutral-700'>
              <Button
                size='lg'
                className='rounded-full bg-transparent bg-gradient-to-r from-neutral-100 via-neutral-100/60 to-neutral-100 [background-size:200%_auto] text-neutral-950 hover:bg-transparent hover:bg-[99%_center]'
                asChild
              >
                <a href='#'>Explore shadcn/studio</a>
              </Button>
            </Card>
          </MotionPreset>
        </div>

        {/* Card 7 */}
        <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} delay={0.4} transition={{ duration: 0.5 }}>
          <Card className='h-full overflow-hidden border-0 bg-gradient-to-b from-neutral-900 to-neutral-700 pb-0'>
            <CardContent className='flex h-full flex-col justify-end gap-6'>
              <div className='-mb-12'>
                <h3 className='text-6xl leading-19.5 font-semibold text-neutral-100'>800+</h3>
                <p className='text-xl font-medium text-neutral-300'>Examples</p>
              </div>
            </CardContent>
            <img src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-12.png' alt='Components Mockup' />
          </Card>
        </MotionPreset>

        {/* Card 8 */}
        <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} delay={0.5} transition={{ duration: 0.5 }}>
          <Card className='h-full gap-7 overflow-hidden border-0 bg-gradient-to-b from-neutral-900 to-neutral-700 pb-0'>
            <CardContent className='flex h-full flex-col justify-end'>
              <div className='text-right'>
                <h3 className='text-6xl leading-19.5 font-semibold text-neutral-100'>78+</h3>
                <p className='text-xl font-medium text-neutral-300'>Free Components</p>
              </div>
            </CardContent>
            <img src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-13.png' alt='Free Components' />
          </Card>
        </MotionPreset>

        {/* Card 9 */}
        <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} delay={0.9} transition={{ duration: 0.5 }}>
          <Card className='h-full overflow-hidden rounded-3xl border-0 bg-gradient-to-tl from-neutral-900 to-neutral-700 max-lg:col-span-full'>
            <CardContent className='flex h-full flex-col justify-between gap-5'>
              <h3 className='text-3xl font-bold text-neutral-100'>Universal Framework Compatibility</h3>

              <div className='relative self-center'>
                <RippleBg className='pointer-events-none absolute inset-0 size-full text-[#E3E3E3] select-none' />

                <div className='relative flex size-56 flex-col items-center justify-between'>
                  <span className='z-1 flex size-12 items-center justify-center rounded-full bg-neutral-100/50'>
                    <img
                      src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/nextjs-logo.png'
                      alt='Next.js Logo'
                      className='h-7'
                    />
                  </span>

                  <div className='flex w-full justify-between'>
                    <span className='z-1 flex size-12 items-center justify-center rounded-full bg-neutral-100/50'>
                      <img
                        src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/vite-logo.png'
                        alt='Vite Logo'
                        className='h-6.5'
                      />
                    </span>
                    <span className='z-1 flex size-12 items-center justify-center rounded-full bg-neutral-100/50'>
                      <img
                        src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/tailwind-logo.png'
                        alt='Tailwind Logo'
                        className='h-5'
                      />
                    </span>
                  </div>

                  <div className='z-1 flex h-8 items-center justify-center overflow-visible'>
                    <Logo className='size-16' />
                  </div>

                  <div className='flex w-full justify-between'>
                    <span className='z-1 flex size-12 items-center justify-center rounded-full bg-neutral-100/50'>
                      <img
                        src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/shadcn-logo.png'
                        alt='Shadcn Logo'
                        className='h-7'
                      />
                    </span>
                    <span className='z-1 flex size-12 items-center justify-center rounded-full bg-neutral-100/50'>
                      <img
                        src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/motion-logo.png'
                        alt='Motion Logo'
                        className='h-7'
                      />
                    </span>
                  </div>

                  <span className='z-1 flex size-12 items-center justify-center rounded-full bg-neutral-100/50'>
                    <img
                      src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/react-logo.png'
                      alt='React Logo'
                      className='h-7'
                    />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionPreset>
      </div>
    </section>
  )
}

export default BentoGrid
