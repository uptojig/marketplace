'use client'

import * as React from 'react'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface WobbleCardProps {
  children: React.ReactNode
  containerClassName?: string
  className?: string
}

function WobbleCard({ children, containerClassName, className }: WobbleCardProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (clientX - (rect.left + rect.width / 2)) / 20
    const y = (clientY - (rect.top + rect.height / 2)) / 20

    setMousePosition({ x, y })
  }

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : 'translate3d(0px, 0px, 0) scale3d(1, 1, 1)',
        transition: 'transform 0.1s ease-out'
      }}
      className={cn('relative mx-auto w-full overflow-hidden', containerClassName)}
    >
      <div className='relative h-full overflow-hidden sm:mx-0 sm:rounded-xl'>
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : 'translate3d(0px, 0px, 0) scale3d(1, 1, 1)',
            transition: 'transform 0.1s ease-out'
          }}
          className={cn('h-full', className)}
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  )
}

export { WobbleCard, type WobbleCardProps }
