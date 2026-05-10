import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  AsteriskIcon,
  EyeOffIcon,
  FingerprintIcon,
  TimerIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'
import { NumberTicker } from '@/components/ui/number-ticker'

import ChartBalance from '@/components/shadcn-studio/blocks/bento-grid-11/chart-balance'
import PendingTransaction from '@/components/shadcn-studio/blocks/bento-grid-11/pending-transaction'
import RandomIcons from '@/components/shadcn-studio/blocks/bento-grid-11/random-icons'
import type { IconType } from '@/components/shadcn-studio/blocks/bento-grid-11/random-icons'

const BentoGrid = ({ icons }: { icons: IconType[] }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-7 lg:px-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-5'>
          <MotionPreset
            component='a'
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            transition={{ duration: 0.45 }}
            motionProps={{
              href: '#'
            }}
            className='from-primary group to-primary/40 text-primary-foreground relative grow overflow-hidden rounded-xl bg-gradient-to-b p-6 pb-0'
          >
            <div className='mb-6 flex items-start gap-4'>
              <h2 className='text-lg text-pretty sm:text-xl lg:text-2xl'>
                <span className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>Fix finance:</span>{' '}
                <span className='opacity-80'>All of your financial work in a single app</span>
              </h2>
              <Button
                size='icon-lg'
                className='text-primary pointer-events-none rounded-full bg-[color-mix(in_oklab,var(--primary)10%,var(--card))] opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[color-mix(in_oklab,var(--primary)20%,var(--card))]'
              >
                <ArrowUpRightIcon />
              </Button>
            </div>
            <div className='flex h-104.5 items-end justify-center p-2.5 pb-0'>
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-48.png'
                alt='Mobile view'
                className='w-full max-w-88 transition-all duration-300 group-hover:scale-105 dark:hidden'
              />
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-48-dark.png'
                alt='Mobile view dark'
                className='hidden w-full max-w-88 transition-all duration-300 group-hover:scale-105 dark:inline-block'
              />
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.2}
            transition={{ duration: 0.45 }}
            className='bg-muted flex flex-col gap-6 rounded-xl p-6'
          >
            <div className='flex grow flex-col items-center justify-center'>
              <RandomIcons icons={icons} />
            </div>
            <div className='space-y-2'>
              <h3 className='text-2xl font-semibold'>Assign role</h3>
              <p className='text-muted-foreground text-lg'>
                Assign custom roles and access levels to every team member with control.
              </p>
            </div>
          </MotionPreset>

          <div className='col-span-full grid grid-cols-1 gap-6 md:grid-cols-3'>
            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 75 }}
              delay={0.8}
              transition={{ duration: 0.45 }}
              className='bg-muted flex flex-col rounded-xl p-6'
            >
              <div className='mb-6 flex grow items-center justify-center pt-6 pr-5 pb-4'>
                <div className='bg-card relative grid size-16 place-content-center rounded-sm'>
                  <TimerIcon className='size-8' />
                  <MotionPreset
                    fade
                    motionProps={{
                      animate: {
                        y: [2, -4, 2],
                        opacity: 1
                      },
                      transition: {
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.8
                        }
                      }
                    }}
                    className='absolute top-0.5 left-0.5 size-6 -translate-x-1/2 -translate-y-1/2'
                  >
                    <FingerprintIcon className='size-6' />
                  </MotionPreset>

                  <MotionPreset
                    fade
                    motionProps={{
                      animate: {
                        y: [2, -4, 2],
                        opacity: 1
                      },
                      transition: {
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.2
                        }
                      }
                    }}
                    className='bg-card/70 absolute right-4 bottom-0 flex w-fit translate-x-full translate-y-1/2 items-center gap-2.5 rounded-sm px-2'
                  >
                    <AsteriskIcon className='size-4' />
                    <AsteriskIcon className='size-4' />
                    <AsteriskIcon className='size-4' />
                  </MotionPreset>
                </div>
              </div>
              <div className='space-y-2'>
                <h3 className='text-2xl font-semibold'>Pending approvals</h3>
                <p className='text-muted-foreground text-lg'>Quickly approve or reject requests in workflow.</p>
              </div>
            </MotionPreset>

            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 75 }}
              delay={1}
              transition={{ duration: 0.45 }}
              className='bg-muted flex flex-col overflow-hidden rounded-xl md:col-span-2'
            >
              <div className='flex h-39 grow items-end'>
                <div className='w-full'>
                  <Marquee pauseOnHover duration={30} gap={0.5} className='px-2 py-1.5'>
                    <div className='flex h-13.5 w-72 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowDownIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>MindSphere Innovations</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-destructive'>$1,300</span>
                        <span className='text-muted-foreground text-xs font-light'>10:00</span>
                      </div>
                    </div>

                    <div className='bg-card flex h-13.5 w-72 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowUpIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>Neurasels</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-green-600 dark:text-green-400'>$1,200</span>
                        <span className='text-muted-foreground text-xs font-light'>12:32</span>
                      </div>
                    </div>

                    <div className='flex h-13.5 w-72 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowDownIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>FutureTech Enterprises</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-destructive'>$1,600</span>
                        <span className='text-muted-foreground text-xs font-light'>15:30</span>
                      </div>
                    </div>
                  </Marquee>

                  <Marquee pauseOnHover reverse duration={30} gap={0.5} className='px-2 py-1.5'>
                    <div className='bg-card flex h-13.5 w-72 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowUpIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>TechNova Solutions</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-green-600 dark:text-green-400'>$1,500</span>
                        <span className='text-muted-foreground text-xs font-light'>14:45</span>
                      </div>
                    </div>

                    <div className='bg-card flex h-13.5 w-72 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowUpIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>InnoWave Technologies</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-green-600 dark:text-green-400'>$2,000</span>
                        <span className='text-muted-foreground text-xs font-light'>09:15</span>
                      </div>
                    </div>

                    <div className='flex h-13.5 w-72 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowDownIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>CreativePulse Systems</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-destructive'>$2,200</span>
                        <span className='text-muted-foreground text-xs font-light'>11:45</span>
                      </div>
                    </div>
                  </Marquee>

                  <Marquee pauseOnHover duration={30} gap={0.5} className='px-2 py-1.5'>
                    <div className='bg-card flex h-13.5 w-72 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowUpIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>Quantum Dynamics Inc.</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-green-600 dark:text-green-400'>$750</span>
                        <span className='text-muted-foreground text-xs font-light'>18:30</span>
                      </div>
                    </div>

                    <div className='flex h-13.5 w-72 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowDownIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>Nexus Quantum Solutions</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-destructive'>$800</span>
                        <span className='text-muted-foreground text-xs font-light'>19:15</span>
                      </div>
                    </div>

                    <div className='bg-card flex h-13.5 w-72 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2'>
                      <div className='bg-primary/10 grid size-9.5 place-content-center rounded-full'>
                        <ArrowUpIcon className='size-5 opacity-60' />
                      </div>
                      <div className='flex flex-1 flex-col items-start gap-0.5'>
                        <span className='text-muted-foreground text-xs font-light'>From</span>
                        <span className='text-sm'>InnoWave Technologies</span>
                      </div>
                      <div className='flex flex-col items-end gap-0.5'>
                        <span className='text-green-600 dark:text-green-400'>$2,000</span>
                        <span className='text-muted-foreground text-xs font-light'>09:15</span>
                      </div>
                    </div>
                  </Marquee>
                </div>
              </div>
              <div className='space-y-2 p-6'>
                <h3 className='text-2xl font-semibold'>Transaction history</h3>
                <p className='text-muted-foreground text-lg'>
                  Explore a complete log of every transaction, filterable by date, type, and status.
                </p>
              </div>
            </MotionPreset>
          </div>
        </div>

        <div className='flex flex-col gap-6 lg:col-span-2'>
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.4}
            transition={{ duration: 0.45 }}
            className='bg-muted rounded-xl py-6'
          >
            <ChartBalance />
            <div className='mt-6 space-y-1 px-6'>
              <h2 className='text-muted-foreground text-lg'>Company&rsquo;s balance</h2>
              <div className='text-2xl font-semibold'>
                $
                <NumberTicker value={36002.5} startValue={12345.67} decimalPlaces={2} damping={40} />
              </div>
              <p className='text-muted-foreground text-lg'>
                Track your company&rsquo;s financial health with visual insights.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.6}
            transition={{ duration: 0.45 }}
            className='bg-muted flex items-center justify-between gap-2 rounded-xl p-6'
          >
            <h3 className='text-xl'>
              <span className='text-2xl font-semibold'>Track</span> every critical change
            </h3>
            <div className='bg-background grid size-12 shrink-0 place-content-center rounded-xl border'>
              <EyeOffIcon className='size-8 shrink-0 stroke-1' />
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={1.2}
            transition={{ duration: 0.45 }}
            className='from-primary to-primary/40 text-primary-foreground flex grow flex-col gap-6 rounded-xl bg-gradient-to-tr p-6'
          >
            <div className='flex grow flex-col justify-center'>
              <PendingTransaction />
            </div>
            <div className='space-y-2'>
              <h3 className='text-2xl font-semibold'>Pending transaction</h3>
              <p className='text-lg opacity-80'>Confirm outgoing payments before they&rsquo;re processed.</p>
            </div>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
