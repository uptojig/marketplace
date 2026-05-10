import type { ReactNode } from 'react'

import { ArrowRightIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GlassButton } from '@/components/ui/glass-button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { NeuralButton } from '@/components/ui/neural-button'
import { SocialGlobe } from '@/components/shadcn-studio/blocks/social-proof-10/social-globe'

type SocialProofProps = {
  id: number
  icon: ReactNode
  title: string
  value: string
}

const SocialProof = ({ socialProofs }: { socialProofs: SocialProofProps[] }) => {
  return (
    <section className='gap-24 bg-black py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex flex-col items-center gap-4 sm:mb-16 lg:mb-24'>
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} blur transition={{ duration: 0.5 }}>
            <Badge variant='outline' className='border-white text-sm text-white'>
              Trusted by Global Teams
            </Badge>
          </MotionPreset>

          <MotionPreset
            component='h2'
            fade
            slide={{ direction: 'down', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
            delay={0.3}
            className='text-center text-2xl font-semibold text-white md:text-3xl lg:text-4xl'
          >
            Trusted by Teams Who Value Smart Automation
          </MotionPreset>

          <MotionPreset
            component='p'
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            delay={0.6}
            transition={{ duration: 0.5 }}
            className='text-center text-xl text-white/80'
          >
            See how our chatbot transforms engagement and efficiency across industries.
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            delay={0.9}
            transition={{ duration: 0.5 }}
            className='flex flex-wrap items-center justify-center gap-4'
          >
            <NeuralButton size='lg'>
              <a href='#'>Get Started - Free</a>
            </NeuralButton>

            <GlassButton asChild size='lg' className='group'>
              <a href='#'>
                View Pricing
                <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
              </a>
            </GlassButton>
          </MotionPreset>
        </div>

        <div className='grid gap-6 lg:grid-cols-4'>
          <div className='flex flex-col gap-7 lg:col-span-2'>
            <MotionPreset
              component='p'
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              delay={1.2}
              transition={{ duration: 0.5 }}
              className='text-lg text-white/80'
            >
              What began as a hobby evolved into a dedicated profession the moment I understood what design can truly
              do. It&apos;s not only about aesthetics, but about solving problems, elevating experiences, and making
              ideas function at their best.
            </MotionPreset>

            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              delay={1.5}
              transition={{ duration: 0.5 }}
              className='grid gap-6 bg-contain bg-center bg-no-repeat sm:grid-cols-2 sm:bg-[url(https://cdn.shadcnstudio.com/ss-assets/template/landing-page/neural/image-03.png)]'
            >
              {socialProofs.map(proof => (
                <div
                  key={proof.id}
                  className='flex flex-col items-center gap-4 rounded-xl bg-linear-to-r from-white/15 to-white/15 py-6 shadow-[inset_-0.4px_-0.4px_0.5px_0_#fff,inset_0.4px_0.4px_0.5px_0_#fff] backdrop-blur-sm'
                >
                  <div className='flex items-center gap-2.5 text-white/80'>
                    {proof.icon}
                    <h3 className='text-xl font-medium'>{proof.title}</h3>
                  </div>
                  <span className='text-2xl font-semibold text-white sm:text-3xl lg:text-4xl'>{proof.value}</span>
                </div>
              ))}
            </MotionPreset>
          </div>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            delay={1.8}
            transition={{ duration: 0.5 }}
            className='relative max-sm:h-100 lg:col-span-2'
          >
            <SocialGlobe />
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/neural/image-04.png'
              alt='galaxy background'
              className='absolute bottom-0'
            />
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
