'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Loader2Icon, SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Shine } from '@/components/ui/shine'

const Generate = ({ children }: { children: ReactNode }) => {
  const [isGenerated, setIsGenerated] = useState<boolean>(false)
  const [isStarted, setIsStarted] = useState<boolean>(false)

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    const runCycle = () => {
      setIsStarted(false)
      setIsGenerated(false)

      // Clear any existing timeouts
      timeouts.forEach(timeout => clearTimeout(timeout))
      timeouts.length = 0

      // 2000ms: set isStarted to true
      timeouts.push(setTimeout(() => setIsStarted(true), 2000))

      // 6000ms: set isStarted to false and isGenerated to true
      timeouts.push(
        setTimeout(() => {
          setIsStarted(false)
          setIsGenerated(true)
        }, 6000)
      )

      // 12700ms: set isGenerated to false
      timeouts.push(setTimeout(() => setIsGenerated(false), 12700))
    }

    // Run the cycle immediately
    runCycle()

    // Repeat every 12.65 seconds
    const interval = setInterval(runCycle, 12700)

    return () => {
      clearInterval(interval)
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  return (
    <div className='bg-muted relative mx-2.5 mt-2.5 flex h-75 flex-col overflow-hidden rounded-xl'>
      <Shine loop deg={-45} duration={2000} className='size-full' enable={isStarted}>
        {isGenerated ? (
          <>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-60.png'
              alt='Product Category'
              className='dark:hidden'
            />
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-60-dark.png'
              alt='Product Category Dark'
              className='hidden dark:inline-block'
            />
          </>
        ) : (
          <>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-61.png'
              alt='Product Category'
              className='dark:hidden'
            />
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-61-dark.png'
              alt='Product Category Dark'
              className='hidden dark:inline-block'
            />
          </>
        )}
      </Shine>
      <div className='from-card pointer-events-none absolute inset-x-0 bottom-0 z-11 h-10 bg-gradient-to-t to-transparent' />
      <div className='border-primary bg-background absolute bottom-2 z-20 flex w-full max-w-93 justify-between self-center rounded-xl border-2 px-3 py-2'>
        {children}
        <Button size='lg' className='w-30' disabled={isStarted}>
          {isStarted ? <Loader2Icon className='animate-spin' /> : <SparklesIcon />}
          {isStarted ? 'Generating' : 'Generate'}
        </Button>
      </div>
    </div>
  )
}

export default Generate
