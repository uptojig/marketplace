// React Imports
import type { SVGAttributes } from 'react'

const GrowLogo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72' fill='none' {...props}>
      <path
        d='M0 7.70917C0 3.45151 3.45152 0 7.70918 0L63.876 0C68.1337 0 71.5852 3.45152 71.5852 7.70918V63.8732C71.5852 68.1308 68.1337 71.5824 63.876 71.5824H7.70918C3.45152 71.5824 0 68.1308 0 63.8732L0 7.70917Z'
        fill='var(--background)'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.40804 0L64.18 0C68.2526 0 71.5852 3.33261 71.5852 7.40517V64.1772C71.5852 68.2526 68.2526 71.5824 64.18 71.5824H7.40804C5.90234 71.5824 4.47408 70.9858 3.30393 70.2086L42.7016 44.4224L51.8763 53.7807L56.9355 15.3094L17.9996 19.2328L27.1857 28.6025L0.275328 66.0787C0.174948 65.594 0 64.6906 0 64.1772L0 7.40517C0 3.33261 3.33261 0 7.40804 0Z'
        fill='var(--primary)'
      />
    </svg>
  )
}

export default GrowLogo
