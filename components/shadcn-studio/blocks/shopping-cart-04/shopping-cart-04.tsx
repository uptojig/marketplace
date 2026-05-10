'use client'

import { useState, type ReactNode } from 'react'

import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button as AriaButton, Group, Input, NumberField } from 'react-aria-components'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader
} from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

type ShoppingCartProps = {
  trigger: ReactNode
  defaultOpen?: boolean
  className?: string
  data: {
    id: string
    name: string
    type: string
    price: number
    image: string
  }[]
}

const ShoppingCart = ({ defaultOpen = false, trigger, data, className }: ShoppingCartProps) => {
  const [open, setOpen] = useState(defaultOpen)

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initialQuantities: Record<string, number> = {}

    data.forEach(item => {
      initialQuantities[item.id] = 1
    })

    return initialQuantities
  })

  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, value)
    }))
  }

  const subtotal = data.reduce((total, item) => total + item.price * (quantities[item.id] || 1), 0)
  const shippingCharge = 9.8
  const total = subtotal + shippingCharge

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className={cn('border-none sm:max-w-155 [&>[data-slot=dialog-close]>svg]:size-5', className)}>
        <DialogTitle className='sr-only'>Cart</DialogTitle>
        <DialogHeader>
          <DialogTitle hidden />
          <DialogDescription hidden />
        </DialogHeader>
        <div className='space-y-6'>
          <div className='space-y-6'>
            {data.map(content => (
              <div key={content.id} className='flex max-sm:flex-col max-sm:gap-y-2 sm:items-center'>
                <div className='flex grow items-center gap-6'>
                  <div className='relative w-fit'>
                    <div className='size-21.5 rounded-md border'>
                      <img src={content.image} alt={content.name} />
                    </div>
                    <Badge className='absolute -end-2.5 -top-2.5 h-5 min-w-5 px-1 tabular-nums'>
                      {quantities[content.id]}
                    </Badge>
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <h4 className='font-medium'>{content.name}</h4>
                    <span className='text-muted-foreground'>{content.type}</span>
                  </div>
                </div>
                <div className='flex grow items-center gap-x-3 gap-y-1.5 max-sm:justify-end sm:flex-col sm:items-end'>
                  <span className='text-lg font-semibold'>${(content.price * quantities[content.id]).toFixed(2)}</span>
                  <NumberField
                    value={quantities[content.id]}
                    onChange={value => handleQuantityChange(content.id, value)}
                    minValue={1}
                    className='w-full max-w-32 space-y-2'
                  >
                    <Group className='dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'>
                      <AriaButton
                        slot='decrement'
                        className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground ms-2 flex aspect-square h-5 items-center justify-center rounded-sm text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <MinusIcon className='size-3' />
                        <span className='sr-only'>Decrement</span>
                      </AriaButton>
                      <Input className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none' />
                      <AriaButton
                        slot='increment'
                        className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground me-2 flex aspect-square h-5 items-center justify-center rounded-sm text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <PlusIcon className='size-3' />
                        <span className='sr-only'>Increment</span>
                      </AriaButton>
                    </Group>
                  </NumberField>
                </div>
              </div>
            ))}
          </div>
          <div className='space-y-4 border-y py-6'>
            <div className='flex items-center justify-between gap-2.5'>
              <p className='text-muted-foreground'>Subtotal</p>
              <p className='text-muted-foreground'>${subtotal.toFixed(2)}</p>
            </div>
            <div className='flex items-center justify-between gap-2.5'>
              <p className='text-muted-foreground'>Shipping fee</p>
              <p className='text-muted-foreground'>${shippingCharge.toFixed(2)}</p>
            </div>
          </div>
          <div className='flex items-center justify-between gap-2.5'>
            <h5 className='grow font-semibold'>Total</h5>
            <div className='flex items-center justify-between gap-2.5'>
              <p className='text-muted-foreground'>USD</p>
              <p className='text-2xl font-semibold'>${total.toFixed(2)}</p>
            </div>
          </div>
          <Button type='submit' size='lg' className='w-full rounded-lg text-base'>
            Confirm Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShoppingCart
