'use client'

import * as React from 'react'

import { motion, useMotionValue, useTransform } from 'framer-motion'

import { cn } from '@/lib/utils'

interface CardRotateProps {
  children: React.ReactNode
  onSendToBack: () => void
  sensitivity: number
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [60, -60])
  const rotateY = useTransform(x, [-100, 100], [-60, 60])

  function handleDragEnd(_: never, info: { offset: { x: number; y: number } }) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack()
    } else {
      x.set(0)
      y.set(0)
    }
  }

  return (
    <motion.div
      className='absolute cursor-grab'
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
      tabIndex={-1}
    >
      {children}
    </motion.div>
  )
}

interface StackProps {
  randomRotation?: boolean
  sensitivity?: number
  sendToBackOnClick?: boolean
  cardsData?: { id: number; img: string; imgDark?: string }[]
  animationConfig?: { stiffness: number; damping: number }
  className?: string
  perspective?: number
}

function CardStack({
  randomRotation = false,
  sensitivity = 200,
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
  className,
  sendToBackOnClick = false,
  perspective
}: StackProps) {
  const [cards, setCards] = React.useState(cardsData)

  const sendToBack = (id: number) => {
    setCards(prev => {
      const newCards = [...prev]
      const index = newCards.findIndex(card => card.id === id)
      const [card] = newCards.splice(index, 1)

      newCards.unshift(card)

      return newCards
    })
  }

  return (
    <div
      className={cn('relative', className)}
      style={{
        perspective: perspective ?? 600
      }}
      tabIndex={-1}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0

        return (
          <CardRotate key={card.id} onSendToBack={() => sendToBack(card.id)} sensitivity={sensitivity}>
            <motion.div
              className='overflow-hidden rounded-md border focus-visible:outline-none'
              onClick={() => sendToBackOnClick && sendToBack(card.id)}
              animate={{
                rotateZ: (cards.length - index - 1) * 2 - randomRotate,
                transformOrigin: 'bottom right'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
              tabIndex={-1}
            >
              <img
                src={card.img}
                alt={`card-${card.id}`}
                className={cn('pointer-events-none h-full w-full object-cover', card.imgDark && 'dark:hidden')}
                tabIndex={-1}
              />
              {card.imgDark && (
                <img
                  src={card.imgDark}
                  alt={`card-${card.id}-dark`}
                  className='pointer-events-none hidden h-full w-full object-cover dark:inline-block'
                  tabIndex={-1}
                />
              )}
            </motion.div>
          </CardRotate>
        )
      })}
    </div>
  )
}

export { CardStack, CardRotate, type StackProps, type CardRotateProps }
