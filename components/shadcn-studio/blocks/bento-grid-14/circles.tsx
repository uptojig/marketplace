'use client'

import { motion } from 'framer-motion'

import { Orbiting } from '@/components/ui/orbiting'

import Logo from '@/assets/svg/logo'

const Circles = () => {
  return (
    <div className='relative flex size-75 shrink-0 items-center justify-center'>
      <Orbiting radius={125} duration={30} strokeWidth={1}>
        <div className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/react-logo.png?width=28&format=auto'
            alt='React Logo'
            className='size-7 rounded-full'
          />
        </div>
        <div className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/shadcn-logo.png?width=28&format=auto'
            alt='Shadcn Logo'
            className='size-7 rounded dark:invert'
          />
        </div>
        <div className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/vite-logo.png?width=26&format=auto'
            alt='Vite Logo'
            className='size-6.5'
          />
        </div>
        <div className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/nextjs-logo.png?width=28&format=auto'
            alt='Next.js Logo'
            className='size-7 rounded-full dark:invert'
          />
        </div>
        <div className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/tailwind-logo.png?width=28&format=auto'
            alt='Tailwind Logo'
            className='w-7 rounded-full'
          />
        </div>
        <div className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
          <img
            src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/motion-logo.png?width=28&format=auto'
            alt='Motion Logo'
            className='size-7 rounded-full'
          />
        </div>
      </Orbiting>
      <motion.svg
        width='1em'
        height='1em'
        viewBox='0 0 246 246'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='absolute size-61.5'
        initial='hidden'
        animate='visible'
      >
        <motion.circle
          strokeOpacity={0.8}
          cx='123'
          cy='123'
          r='80'
          stroke='var(--border)'
          strokeWidth='1.125'
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: {
                scale: { delay: 0.36, duration: 2.75, repeat: Infinity, ease: 'easeOut' }
              }
            }
          }}
        />
        <motion.circle
          strokeOpacity={1}
          cx='123'
          cy='123'
          r='50'
          stroke='var(--border)'
          strokeWidth='1.125'
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: {
                scale: { delay: 0.48, duration: 2.75, repeat: Infinity, ease: 'easeOut' }
              }
            }
          }}
        />
      </motion.svg>
      <Logo className='size-16' />
      <div className='from-card pointer-events-none absolute inset-x-0 -bottom-1.5 h-10 bg-gradient-to-t from-10% to-transparent' />
    </div>
  )
}

export default Circles
