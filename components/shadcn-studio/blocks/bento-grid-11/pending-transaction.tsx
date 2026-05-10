'use client'

import { useState, useEffect } from 'react'

import { ArrowUpDownIcon, CheckIcon, ChevronDownIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

const PendingTransaction = () => {
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsStarted(true)
    }, 1650)

    const timer2 = setTimeout(() => {
      setIsCompleted(true)
    }, 2250)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <motion.div
      className='flex flex-col transition-all duration-300'
      initial={{ gap: 20 }}
      animate={{
        gap: isStarted ? 0 : 20
      }}
      transition={{
        duration: 0.6,
        ease: [0.32, 0.72, 0, 1]
      }}
    >
      <motion.div
        className={cn(
          'bg-card text-card-foreground tr relative flex w-full items-start justify-between gap-2 rounded-xl px-3 py-1.5 transition-all duration-300',
          isCompleted && 'rounded-b-none'
        )}
        animate={{
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.6,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        <div className='flex items-end gap-2'>
          <div className='flex flex-col items-center gap-2'>
            <span className='text-muted-foreground text-xs font-light'>To</span>
            <Avatar className='size-6'>
              <AvatarImage
                src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png?width=24&format=auto'
                alt='Jack'
              />
              <AvatarFallback className='text-xs'>J</AvatarFallback>
            </Avatar>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-sm'>Jack</span>
            <ChevronDownIcon className='text-muted-foreground size-4' />
          </div>
        </div>
        <div className='flex flex-col items-end gap-0.5'>
          <span className='text-muted-foreground text-xs font-light'>Monthly salary</span>
          <span className='text-lg'>$8,00</span>
        </div>
        <motion.div
          className={cn(
            'bg-primary absolute top-full left-1/2 flex size-11 -translate-x-1/2 -translate-y-3.5 items-center justify-center rounded-full transition-all duration-300 lg:max-[1078px]:size-7',
            isCompleted && '-translate-y-1/2'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <AnimatePresence mode='wait'>
            {!isCompleted ? (
              <motion.div
                key='progress'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  rotate: 360
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut'
                }}
              >
                <ArrowUpDownIcon className='text-primary-foreground size-5' />
              </motion.div>
            ) : (
              <motion.div
                key='completed'
                initial={{
                  opacity: 0,
                  rotate: -180
                }}
                animate={{
                  opacity: 1,
                  rotate: 0
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut'
                }}
              >
                <CheckIcon className='text-primary-foreground size-5' />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.div
        className={cn(
          'bg-card text-card-foreground flex w-full items-start justify-between gap-2 rounded-xl px-3 py-1.5 transition-all duration-300',
          isCompleted && 'rounded-t-none'
        )}
        animate={{
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.6,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        <div className='flex items-end gap-2'>
          <div className='flex flex-col items-center gap-2'>
            <span className='text-muted-foreground text-xs font-light'>From</span>
            <span className='bg-muted rounded-sm p-1.5'>
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/master.png?height=16&format=auto'
                alt='Mastercard'
              />
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-sm'>Master card</span>
            <ChevronDownIcon className='text-muted-foreground size-4' />
          </div>
        </div>
        <div className='flex flex-col items-end gap-0.5'>
          <span className='text-muted-foreground text-xs font-light'>Amount</span>
          <span className='text-lg'>$8,00</span>
          <span className='text-muted-foreground text-xs font-light'>Balance: $2,400</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PendingTransaction
