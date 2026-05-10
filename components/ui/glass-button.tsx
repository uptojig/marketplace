'use client'

import * as React from 'react'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Button, type buttonVariants } from '@/components/ui/button'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: VariantProps<typeof buttonVariants>['size']
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

function GlassButton({ children, size, asChild = false, className, ...props }: GlassButtonProps) {
  return (
    <Button
      size={size}
      asChild={asChild}
      className={cn(
        size === 'lg' && 'text-base has-[>svg]:px-6',
        'relative inline-flex shrink-0 rounded-lg !bg-transparent bg-clip-padding text-white!',

        // Glass effect
        'bg-linear-to-l from-white/15 to-white/25 backdrop-blur-xs',

        'before:pointer-events-none before:absolute before:inset-0 before:size-full before:rounded-[inherit] before:border before:border-transparent before:bg-origin-border',

        // Conic gradient
        'before:bg-[conic-gradient(from_var(--button-angle)_at_50%_50%,rgba(255,255,255,0.5),rgba(255,255,255,0)_10%_43%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0)_73%_93%,rgba(255,255,255,0.5))]',

        //masking
        'before:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] before:mask-exclude before:[mask-clip:content-box,border-box]',

        // Hover
        'before:transition-[--button-angle] before:duration-500 before:ease-in-out hover:before:[--button-angle:-125deg]',

        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export { GlassButton, type GlassButtonProps }
