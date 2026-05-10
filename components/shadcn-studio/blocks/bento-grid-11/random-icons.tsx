'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'

import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type IconType = keyof typeof Icons

type RandomIconsProps = {
  icons: IconType[]
  interval?: number // interval in milliseconds
}

const RandomIcons = ({ icons, interval = 1500 }: RandomIconsProps) => {
  const [gridItems, setGridItems] = useState<ReturnType<typeof generateGridItems>>([])
  const [iconPool, setIconPool] = useState([...icons])
  const [isClient, setIsClient] = useState(false)

  const generateGridItems = () => {
    // Create 20 divs total: 5 empty, 11 with card background + icon, 4 with primary background + icon
    const items = []

    // Get first 15 unique icons and shuffle
    const shuffledIcons = [...icons].slice(0, 15).sort(() => Math.random() - 0.5)

    // Add 11 card divs, 4 primary divs, and 5 empty divs
    shuffledIcons.forEach((icon, i) => {
      items.push({
        id: i,
        type: i < 11 ? 'card' : 'primary',
        icon,
        hasIcon: true
      })
    })

    for (let i = 15; i < 20; i++) {
      items.push({
        id: i,
        type: 'card',
        icon: '',
        hasIcon: false
      })
    }

    // Shuffle positions
    return items.sort(() => Math.random() - 0.5)
  }

  // Handle client-side mounting to avoid hydration errors
  useEffect(() => {
    setGridItems(generateGridItems())
    setIsClient(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isClient) return

    const intervalId = setInterval(() => {
      setGridItems(prevItems => {
        const newItems = [...prevItems]

        // Count current divs by type
        const cardDivs = newItems
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => item.hasIcon && item.type === 'card')

        const primaryDivs = newItems
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => item.hasIcon && item.type === 'primary')

        const emptyDivs = newItems.map((item, index) => ({ item, index })).filter(({ item }) => !item.hasIcon)

        const cardCount = cardDivs.length
        const primaryCount = primaryDivs.length
        const emptyCount = emptyDivs.length

        // Determine what action to take
        let action: 'removeCard' | 'removePrimary' | 'addCard' | 'addPrimary' | null = null

        if (cardCount > 11) {
          action = 'removeCard'
        } else if (cardCount < 9 && emptyCount > 0) {
          action = 'addCard'
        } else if (primaryCount > 5) {
          action = 'removePrimary'
        } else if (primaryCount < 3 && emptyCount > 0) {
          action = 'addPrimary'
        } else {
          // Random action within valid ranges
          const possibleActions = []

          if (cardCount < 11 && emptyCount > 0) possibleActions.push('addCard')
          if (cardCount > 9) possibleActions.push('removeCard')
          if (primaryCount < 5 && emptyCount > 0) possibleActions.push('addPrimary')
          if (primaryCount > 3) possibleActions.push('removePrimary')

          if (possibleActions.length > 0) {
            action = possibleActions[Math.floor(Math.random() * possibleActions.length)] as any
          }
        }

        if (!action) return newItems

        if (action === 'removeCard' && cardDivs.length > 0) {
          const randomDiv = cardDivs[Math.floor(Math.random() * cardDivs.length)]

          newItems[randomDiv.index] = {
            ...newItems[randomDiv.index],
            hasIcon: false,
            icon: ''
          }
        } else if (action === 'removePrimary' && primaryDivs.length > 0) {
          const randomDiv = primaryDivs[Math.floor(Math.random() * primaryDivs.length)]

          newItems[randomDiv.index] = {
            ...newItems[randomDiv.index],
            hasIcon: false,
            icon: ''
          }
        } else if ((action === 'addCard' || action === 'addPrimary') && emptyDivs.length > 0) {
          const randomEmptyDiv = emptyDivs[Math.floor(Math.random() * emptyDivs.length)]

          // Get all currently used icons
          const usedIcons = newItems.filter(item => item.hasIcon && item.icon).map(item => item.icon)

          // Get next icon that's not already in use
          let nextIcon = iconPool[0]
          let poolIndex = 0

          while (usedIcons.includes(nextIcon) && poolIndex < iconPool.length) {
            poolIndex++
            nextIcon = iconPool[poolIndex % iconPool.length]
          }

          // Update icon pool in the next tick to avoid batching issues
          setTimeout(() => {
            setIconPool(prev => {
              const newPool = [...prev]

              newPool.splice(poolIndex, 1)
              newPool.push(nextIcon)

              return newPool
            })
          }, 0)

          const bgType = action === 'addCard' ? 'card' : 'primary'

          newItems[randomEmptyDiv.index] = {
            ...newItems[randomEmptyDiv.index],
            hasIcon: true,
            icon: nextIcon,
            type: bgType
          }
        }

        return newItems
      })
    }, interval)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, isClient])

  return (
    <div className='grid w-full max-w-96 grid-cols-5 gap-1.5'>
      {isClient &&
        gridItems.map(item => {
          const IconComponent = item.hasIcon
            ? ((Icons as any)[item.icon] as ComponentType<{ className?: string }>)
            : null

          return (
            <motion.div
              key={item.id}
              layout
              animate={{ opacity: 1 }}
              transition={{
                layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3 }
              }}
              className={cn(
                'grid aspect-square place-content-center rounded-xl border transition-all duration-300',
                item.hasIcon && item.type === 'primary' && 'bg-primary text-primary-foreground',
                item.hasIcon && item.type === 'card' && 'bg-background'
              )}
            >
              {item.hasIcon && IconComponent && (
                <motion.div
                  key={item.icon}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <IconComponent className='size-8 stroke-1' />
                </motion.div>
              )}
            </motion.div>
          )
        })}
    </div>
  )
}

export default RandomIcons
