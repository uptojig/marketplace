'use client'

import { useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export type ProductCard = {
  img: string
  title: string
  buttonClass?: string
  badgeClass?: string
  discount?: number
  productLink: string
  mainClass?: string
}[]

interface CardTransform {
  rotateX: number
  rotateY: number
  scale: number
}

const ProductCard3D = ({ item }: { item: ProductCard[number] }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastMousePosition = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const card = cardRef.current
    const imageWrapper = imageWrapperRef.current

    if (!card || !imageWrapper) return

    let rect: DOMRect
    let centerX: number
    let centerY: number

    const updateCardTransform = (mouseX: number, mouseY: number) => {
      if (!rect) {
        rect = card.getBoundingClientRect()
        centerX = rect.left + rect.width / 2
        centerY = rect.top + rect.height / 2
      }

      const relativeX = mouseX - centerX
      const relativeY = mouseY - centerY

      const cardTransform: CardTransform = {
        rotateX: -relativeY * 0.035,
        rotateY: relativeX * 0.035,
        scale: 1.025
      }

      const imageTransform: CardTransform = {
        rotateX: -relativeY * 0.025,
        rotateY: relativeX * 0.025,
        scale: 1.1
      }

      return { cardTransform, imageTransform }
    }

    const animate = () => {
      const { cardTransform, imageTransform } = updateCardTransform(
        lastMousePosition.current.x,
        lastMousePosition.current.y
      )

      card.style.transform = `perspective(1000px) rotateX(${cardTransform.rotateX}deg) rotateY(${cardTransform.rotateY}deg) scale3d(${cardTransform.scale}, ${cardTransform.scale}, ${cardTransform.scale})`
      card.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.2)'

      imageWrapper.style.transform = `perspective(1000px) rotateX(${imageTransform.rotateX}deg) rotateY(${imageTransform.rotateY}deg) scale3d(${imageTransform.scale}, ${imageTransform.scale}, ${imageTransform.scale})`

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY }

      if (!rect) {
        rect = card.getBoundingClientRect()
        centerX = rect.left + rect.width / 2
        centerY = rect.top + rect.height / 2
      }
    }

    const handleMouseEnter = () => {
      rect = card.getBoundingClientRect()
      centerX = rect.left + rect.width / 2
      centerY = rect.top + rect.height / 2
      card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'
      imageWrapper.style.transition = 'transform 0.2s ease'
      animate()
    }

    const handleMouseLeave = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
      card.style.boxShadow = 'none'
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'

      imageWrapper.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
      imageWrapper.style.transition = 'transform 0.5s ease'

      rect = undefined as unknown as DOMRect
    }

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const hash = item.title.length;
  const badgeType = hash % 3 === 0 ? 'NEW' : hash % 3 === 1 ? 'SALE' : null;

  return (
    <div
      ref={cardRef}
      className={cn(
        'group relative bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#fed7aa]/50 w-full',
        item.mainClass
      )}
    >
      <a href={item.productLink} className="absolute inset-0 z-10" aria-label={`View ${item.title}`} />
      
      <div ref={imageWrapperRef} className="relative aspect-square w-full overflow-hidden bg-[#fff7ed] rounded-2xl mb-4 p-4">
        <div className="absolute inset-0 bg-white shadow-inner m-4 rounded-xl border border-[#fed7aa]/30"></div>
        
        <div className="relative w-full h-full flex items-center justify-center p-2 z-10">
          <div className="w-[85%] h-[85%] relative">
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
        
        {badgeType === 'NEW' && (
          <div className="absolute top-4 right-4 bg-[#facc15] text-[#7c2d12] font-[family:var(--font-prompt)] font-bold text-xs px-3 py-1 rounded-full z-20 shadow-sm transform rotate-12">
            NEW
          </div>
        )}
        {badgeType === 'SALE' && (
          <div className="absolute top-4 right-4 bg-[#f97316] text-white font-[family:var(--font-prompt)] font-bold text-xs px-3 py-1 rounded-full z-20 shadow-sm transform rotate-12">
            ลดราคา
          </div>
        )}
      </div>

      <div className="text-center px-2 z-20 relative pointer-events-none">
        <p className="font-[family:var(--font-prompt)] text-xs text-[#f97316] mb-1 font-medium uppercase tracking-wider">
          {item.badge || 'สินค้าน่ารัก'}
        </p>
        <h3 className="text-lg font-[family:var(--font-kanit)] font-bold text-[#7c2d12] mb-2 line-clamp-1 group-hover:text-[#f97316] transition-colors" title={item.title}>
          {item.title}
        </h3>
        <div className="flex justify-center items-center gap-2 font-[family:var(--font-prompt)] mb-4">
          <span className="text-[#7c2d12] font-bold">{item.misc}</span>
        </div>
        
        <button
          className="w-full py-3 bg-[#fff7ed] text-[#f97316] rounded-xl font-[family:var(--font-prompt)] font-medium group-hover:bg-[#f97316] group-hover:text-white transition-colors duration-300 border border-[#fed7aa] flex items-center justify-center gap-2 relative z-20 pointer-events-auto"
        >
          <Plus className="w-4 h-4" />
          หยิบใส่ตะกร้า
        </button>
      </div>
    </div>
  )
}

export default ProductCard3D
