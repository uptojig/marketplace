'use client'
import { ArrowRightIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PrimaryGrowButton, SecondaryGrowButton } from '@/components/ui/grow-button'
import { MotionPreset } from '@/components/ui/motion-preset'
import GrowLogo from '@/assets/svg/grow-logo'

type AppIcon = {
  name: string
  icon: string
  bgColor: string
}

const AppIntegration = ({ apps }: { apps: AppIcon[] }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 items-center gap-11 lg:grid-cols-7 xl:grid-cols-5'>
          {/* Left Side - Content */}
          <div className='col-span-1 space-y-6 lg:col-span-4 xl:col-span-3'>
            <MotionPreset
              component='p'
              className='text-primary text-sm font-medium tracking-wider'
              fade
              slide={{ direction: 'left', offset: 30 }}
              blur
              transition={{ duration: 0.4 }}
            >
              <Badge variant='outline' className='text-sm font-normal'>
                Data Bridge
              </Badge>
            </MotionPreset>

            <MotionPreset
              component='h2'
              className='text-2xl font-semibold md:text-3xl lg:text-4xl'
              fade
              slide={{ direction: 'left', offset: 50 }}
              blur
              delay={0.1}
              transition={{ duration: 0.5 }}
            >
              Turn marketing data into insights.
            </MotionPreset>

            <MotionPreset
              component='p'
              className='text-muted-foreground text-xl'
              fade
              slide={{ direction: 'left', offset: 50 }}
              blur
              delay={0.2}
              transition={{ duration: 0.5 }}
            >
              Unify and analyze all your marketing channels in one AI-powered dashboard. Seamlessly connect campaigns,
              track performance, and uncover patterns that fuel growth—whether it&apos;s grassroots, just data, or
              smarter decisions.
            </MotionPreset>

            <MotionPreset
              fade
              slide={{ direction: 'left', offset: 30 }}
              blur
              delay={0.3}
              transition={{ duration: 0.5 }}
              className='flex flex-col gap-3 sm:flex-row sm:gap-4'
            >
              <PrimaryGrowButton size='lg' asChild>
                <a href='#'>Get Started - Free</a>
              </PrimaryGrowButton>
              <SecondaryGrowButton size='lg' asChild>
                <a href='#'>
                  View Pricing <ArrowRightIcon />
                </a>
              </SecondaryGrowButton>
            </MotionPreset>
          </div>

          {/* Right Side - Floating App Icons */}
          <div className='relative flex h-90 w-full items-center justify-center max-lg:mx-auto max-lg:max-w-115 md:h-112 lg:col-span-3 xl:col-span-2'>
            {/* Central Grow Logo */}
            <MotionPreset
              fade
              zoom={{ initialScale: 0.8 }}
              delay={0.2}
              transition={{ duration: 0.6 }}
              className='bg-accent relative z-10 flex size-23 flex-col items-center justify-center gap-3 rounded-lg border-3 shadow-[inset_0_0_15px_color-mix(in_oklab,var(--primary)60%,transparent)] md:size-29'
            >
              <GrowLogo className='size-7' />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/cta/grow-text.png'
                alt='Website Mockups Grid'
                className='w-10 md:w-16 dark:hidden'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/cta/grow-text-dark.png'
                alt='Website Mockups Grid'
                className='hidden w-10 md:w-16 dark:inline-block'
              />
            </MotionPreset>

            {/* Instagram - Top */}
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 30 }}
              delay={0.4}
              transition={{ duration: 0.5 }}
              className='absolute top-0 left-1/2 -translate-x-1/2'
            >
              <div className='relative flex flex-col items-center'>
                <Avatar className={`${apps[0].bgColor} border-background relative z-2 size-12 border-2 p-2.5`}>
                  <AvatarImage src={apps[0].icon} alt={apps[0].name} />
                  <AvatarFallback className='text-xs'>{apps[0].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -top-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-40 w-0.5'>
                  <div className='border-border absolute inset-0 border-l-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 left-0 h-6 w-0.5 bg-gradient-to-b from-transparent'
                    motionProps={{
                      animate: { top: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>

            {/* Google - Top Left */}
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 30 }}
              delay={1.2}
              transition={{ duration: 0.5 }}
              className='absolute top-15 left-9 origin-top -rotate-47 lg:max-xl:top-14 lg:max-xl:left-0 lg:max-xl:-rotate-41'
            >
              <div className='relative flex flex-col items-center'>
                <Avatar
                  className={`${apps[7].bgColor} border-background relative z-2 size-12 rotate-45 border-2 p-2.5`}
                >
                  <AvatarImage src={apps[7].icon} alt={apps[7].name} />
                  <AvatarFallback className='text-xs'>{apps[7].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -top-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-40 w-0.5'>
                  <div className='border-border absolute inset-0 border-l-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 left-0 h-6 w-0.5 bg-gradient-to-b from-transparent'
                    motionProps={{
                      animate: { top: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>

            {/* GitHub - Top Right */}
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 30 }}
              delay={0.6}
              transition={{ duration: 0.5 }}
              className='absolute top-15 right-9 origin-top rotate-47 lg:max-xl:top-14 lg:max-xl:right-0 lg:max-xl:rotate-41'
            >
              <div className='relative flex flex-col items-center'>
                <Avatar
                  className={`${apps[1].bgColor} border-background relative z-2 size-12 -rotate-45 border-2 p-2.5`}
                >
                  <AvatarImage src={apps[1].icon} alt={apps[1].name} />
                  <AvatarFallback className='text-xs'>{apps[1].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -top-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-40 w-0.5'>
                  <div className='border-border absolute inset-0 border-l-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 left-0 h-6 w-0.5 bg-gradient-to-b from-transparent'
                    motionProps={{
                      animate: { top: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>

            {/* YouTube - Right */}
            <MotionPreset
              fade
              slide={{ direction: 'left', offset: 30 }}
              delay={0.7}
              transition={{ duration: 0.5 }}
              className='absolute top-1/2 right-0 -translate-y-1/2'
            >
              <div className='relative flex items-center'>
                <div className='relative h-0.5 w-40'>
                  <div className='border-border absolute inset-0 border-t-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 right-0 h-0.5 w-6 bg-gradient-to-l from-transparent'
                    motionProps={{
                      animate: { right: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
                <Avatar className={`${apps[2].bgColor} border-background relative z-2 size-12 border-2 p-2.5`}>
                  <AvatarImage src={apps[2].icon} alt={apps[2].name} />
                  <AvatarFallback className='text-xs'>{apps[2].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -right-2 z-1 size-16 rounded-full'></div>
              </div>
            </MotionPreset>

            {/* Gmail - Bottom Right */}
            <MotionPreset
              fade
              slide={{ direction: 'up', offset: 30 }}
              delay={0.8}
              transition={{ duration: 0.5 }}
              className='absolute right-28 bottom-7 rotate-[135deg] lg:max-xl:right-18 lg:max-xl:rotate-142'
            >
              <div className='relative flex flex-col items-center'>
                <Avatar
                  className={`${apps[3].bgColor} border-background relative z-2 size-12 rotate-224 border-2 p-2.5`}
                >
                  <AvatarImage src={apps[3].icon} alt={apps[3].name} />
                  <AvatarFallback className='text-xs'>{apps[3].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -top-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-40 w-0.5'>
                  <div className='border-border absolute inset-0 border-l-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 left-0 h-6 w-0.5 bg-gradient-to-b from-transparent'
                    motionProps={{
                      animate: { top: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>

            {/* LinkedIn - Bottom */}
            <MotionPreset
              fade
              slide={{ direction: 'up', offset: 30 }}
              delay={0.9}
              transition={{ duration: 0.5 }}
              className='absolute bottom-0 left-1/2 -translate-x-1/2'
            >
              <div className='relative flex flex-col-reverse items-center'>
                <Avatar className={`${apps[4].bgColor} border-background relative z-2 size-12 border-2 p-2.5`}>
                  <AvatarImage src={apps[4].icon} alt={apps[4].name} />
                  <AvatarFallback className='text-xs'>{apps[4].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -bottom-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-40 w-0.5'>
                  <div className='border-border absolute inset-0 border-l-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute bottom-0 left-0 h-6 w-0.5 bg-gradient-to-t from-transparent'
                    motionProps={{
                      animate: { bottom: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>

            {/* WhatsApp - Bottom Left */}
            <MotionPreset
              fade
              slide={{ direction: 'up', offset: 30 }}
              delay={1}
              transition={{ duration: 0.5 }}
              className='absolute bottom-7 left-28 -rotate-[135deg] lg:max-xl:left-18 lg:max-xl:-rotate-142'
            >
              <div className='relative flex flex-col items-center'>
                <Avatar
                  className={`${apps[5].bgColor} border-background relative z-2 size-12 rotate-135 border-2 p-2.5`}
                >
                  <AvatarImage src={apps[5].icon} alt={apps[5].name} />
                  <AvatarFallback className='text-xs'>{apps[5].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -top-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-40 w-0.5'>
                  <div className='border-border absolute inset-0 border-l-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 left-0 h-6 w-0.5 bg-gradient-to-b from-transparent'
                    motionProps={{
                      animate: { top: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>

            {/* Facebook - Left */}
            <MotionPreset
              fade
              slide={{ direction: 'right', offset: 30 }}
              delay={1.1}
              transition={{ duration: 0.5 }}
              className='absolute top-1/2 left-0 -translate-y-1/2'
            >
              <div className='relative flex items-center'>
                <Avatar className={`${apps[6].bgColor} border-background relative z-2 size-12 border-2 p-2.5`}>
                  <AvatarImage src={apps[6].icon} alt={apps[6].name} />
                  <AvatarFallback className='text-xs'>{apps[6].name}</AvatarFallback>
                </Avatar>
                <div className='bg-background absolute -left-2 z-1 size-16 rounded-full'></div>
                <div className='relative h-0.5 w-40'>
                  <div className='border-border absolute inset-0 border-t-2 border-dashed' />
                  <MotionPreset
                    component='span'
                    className='to-primary absolute top-0 left-0 h-0.5 w-6 bg-gradient-to-r from-transparent'
                    motionProps={{
                      animate: { left: ['0%', '100%'] },
                      transition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 0.25 }
                    }}
                  />
                </div>
              </div>
            </MotionPreset>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppIntegration
