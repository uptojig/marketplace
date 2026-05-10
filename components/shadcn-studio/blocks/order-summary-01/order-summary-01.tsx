'use client'

import { useState, type ReactNode } from 'react'

import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button as AriaButton, Group, Input, NumberField } from 'react-aria-components'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type OrderSummaryProps = {
  trigger: ReactNode
  defaultOpen?: boolean
  className?: string
  data: {
    id: string
    name: string
    price: number
    image: string
    color: string
    size: string
  }[]
  orderID: number
}

const OrderSummary = ({ defaultOpen = false, trigger, data, orderID, className }: OrderSummaryProps) => {
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
  const shippingCharge = 22.5
  const discount = 50
  const total = subtotal + shippingCharge - discount

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent
        className={cn(
          'flex max-h-[min(910px,95vh)] flex-col p-0 max-sm:max-h-[min(650px,80vh)] md:max-w-180 lg:max-w-197.5 [&>[data-slot=dialog-close]>svg]:size-5',
          className
        )}
      >
        <ScrollArea className='flex max-h-full flex-col overflow-hidden'>
          <div className='space-y-6 p-6'>
            <DialogHeader>
              <DialogTitle className='text-2xl'>Your Order Details</DialogTitle>
              <DialogDescription className='sr-only'>Order details</DialogDescription>
            </DialogHeader>
            <div className='flex gap-4 rounded-md border p-6 max-md:flex-col md:items-center'>
              <div className='flex grow flex-col gap-2 font-medium md:border-r'>
                <p className='text-muted-foreground'>Order Date</p>
                <p className='text-lg'>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className='flex grow flex-col gap-2 font-medium md:border-r'>
                <p className='text-muted-foreground'>Delivery Date</p>
                <p className='text-lg'>
                  {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className='flex grow flex-col gap-2 font-medium md:border-r'>
                <p className='text-muted-foreground'>Order ID</p>
                <p className='text-lg'>#{orderID}</p>
              </div>
              <div className='flex grow flex-col gap-2 font-medium'>
                <p className='text-muted-foreground'>Payment Method</p>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/master.png'
                  alt='mastercard'
                  className='w-6.5'
                />
              </div>
            </div>
            <div className='space-y-6'>
              {data.map(content => (
                <div key={content.id} className='grid gap-3.5 rounded-lg border px-6 py-4 md:grid-cols-2'>
                  <div className='flex items-center gap-4'>
                    <img src={content.image} alt={content.name} className='size-18 rounded-md' />
                    <div className='flex flex-col gap-1.5'>
                      <h4 className='font-medium'>{content.name}</h4>
                      <span className='text-muted-foreground'>
                        {content.color} : {content.size}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <NumberField
                      value={quantities[content.id]}
                      onChange={value => handleQuantityChange(content.id, value)}
                      minValue={1}
                      aria-label='Quantity'
                      className='w-full max-w-32 space-y-2'
                    >
                      <Group className='dark:bg-input/30 border-input data-focus-within:sm:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'>
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
                    <span className='text-lg font-semibold'>
                      ${(content.price * quantities[content.id]).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className='space-y-3 rounded-md border p-6'>
              <div className='flex items-center justify-between gap-2.5'>
                <p className='text-muted-foreground'>Subtotal</p>
                <p>${subtotal.toFixed(2)}</p>
              </div>
              <div className='flex items-center justify-between gap-2.5'>
                <p className='text-muted-foreground'>Discount</p>
                <p>-${discount.toFixed(2)}</p>
              </div>
              <div className='flex items-center justify-between gap-2.5'>
                <p className='text-muted-foreground'>Shipping cost</p>
                <p>${shippingCharge.toFixed(2)}</p>
              </div>
              <Separator />
              <div className='flex items-center justify-between gap-2.5 text-lg font-semibold'>
                <h5 className='grow'>Grand total</h5>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button type='submit' size='lg' className='mt-5 w-full rounded-lg text-base'>
                Continue Shopping
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default OrderSummary
