'use client'

import * as React from 'react'

import { motion, stagger, useAnimate, useInView } from 'framer-motion'

import { cn } from '@/lib/utils'

function TypewriterEffect({
  words,
  className,
  cursorClassName
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split('')
    }
  })

  // Hooks
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)

  React.useEffect(() => {
    if (isInView) {
      animate(
        'span',
        {
          display: 'inline-block',
          opacity: 1,
          width: 'fit-content'
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: 'easeInOut'
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView])

  const renderWords = () => {
    return (
      <motion.div ref={scope} className='inline'>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className='inline-block'>
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(`hidden text-black opacity-0 dark:text-white`, word.className)}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div className={cn('text-center text-base font-bold sm:text-xl md:text-3xl lg:text-5xl', className)}>
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className={cn('inline-block h-4 w-[4px] rounded-sm bg-blue-500 md:h-6 lg:h-10', cursorClassName)}
      ></motion.span>
    </div>
  )
}

function TypewriterEffectSmooth({
  words,
  className,
  cursorClassName
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split('')
    }
  })

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className='inline-block'>
              {word.text.map((char, index) => (
                <span key={`char-${index}`} className={cn(`text-black dark:text-white`, word.className)}>
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex space-x-1', className)}>
      <motion.div
        className='inline-block overflow-hidden'
        initial={{
          width: 0
        }}
        whileInView={{
          width: 'fit-content'
        }}
        transition={{
          duration: 1,
          ease: 'linear',
          delay: 0.5
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap'
          }}
        >
          {renderWords()}
        </div>
      </motion.div>
      <motion.span
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          duration: 0.5,

          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className={cn('bg-primary inline-block h-6.5 w-0.5 rounded-sm', cursorClassName)}
      />
    </div>
  )
}

function TypewriterEffectCycling({
  words,
  className,
  cursorClassName,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  typeSpeed?: number
  deleteSpeed?: number
  delayBetweenWords?: number
}) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const [currentText, setCurrentText] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isWaiting, setIsWaiting] = React.useState(false)

  React.useEffect(() => {
    if (words.length === 0) return

    const currentWord = words[currentWordIndex].text

    const timeout = setTimeout(
      () => {
        if (isWaiting) {
          setIsWaiting(false)
          setIsDeleting(true)

          return
        }

        if (isDeleting) {
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentWordIndex(prev => (prev + 1) % words.length)
          }
        } else {
          if (currentText.length < currentWord.length) {
            setCurrentText(currentWord.slice(0, currentText.length + 1))
          } else {
            setIsWaiting(true)
          }
        }
      },
      isWaiting ? delayBetweenWords : isDeleting ? deleteSpeed : typeSpeed
    )

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, isWaiting, words, typeSpeed, deleteSpeed, delayBetweenWords])

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <span className={cn('text-black dark:text-white', words[currentWordIndex]?.className)}>{currentText}</span>
      <motion.span
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className={cn('bg-primary inline-block h-6 w-0.5 rounded-sm', cursorClassName)}
      />
    </div>
  )
}

export { TypewriterEffect, TypewriterEffectSmooth, TypewriterEffectCycling }
