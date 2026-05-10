'use client'

import { motion } from 'framer-motion'

const CircleSVG = () => {
  return (
    <motion.svg
      height='206'
      width='206'
      xmlns='http://www.w3.org/2000/svg'
      initial='hidden'
      animate='visible'
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90'
    >
      <motion.circle
        r='101'
        cx='103'
        cy='103'
        stroke='white'
        strokeOpacity='0.6'
        strokeWidth='4'
        fill='black'
        variants={{
          hidden: { pathLength: 0 },
          visible: {
            pathLength: 1,
            transition: {
              duration: 1.75,
              delay: 1.15
            }
          }
        }}
      />
    </motion.svg>
  )
}

export default CircleSVG
