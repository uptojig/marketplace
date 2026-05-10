'use client'

import { useState, type ReactNode } from 'react'

import { Trash2Icon } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Constants
const FREE_DELIVERY_THRESHOLD = 50
const DELIVERY_FEE = 60
const DEFAULT_DISCOUNT_PERCENTAGE = 5

type ShoppingCartProps = {
  trigger: ReactNode
  defaultOpen?: boolean
  discountPercentage?: number
  onSizeChange?: (itemId: number, newSize: string) => void
  cartItems: {
    id: number
    name: string
    size: string
    price: number
    image: string
  }[]
  availableSizes: {
    value: string
    label: string
  }[]
}

const ShoppingCart = ({
  defaultOpen = false,
  trigger,
  cartItems,
  availableSizes,
  onSizeChange,
  discountPercentage = DEFAULT_DISCOUNT_PERCENTAGE
}: ShoppingCartProps) => {
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initialQuantities: Record<number, number> = {}

    cartItems.forEach(item => {
      initialQuantities[item.id] = 1
    })

    return initialQuantities
  })

  const handleQuantityChange = (itemId: number, value: string) => {
    const newQuantity = Math.max(1, parseInt(value) || 1)

    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }))
  }

  const [deletedItems, setDeletedItems] = useState<Set<number>>(new Set())
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({})

  const handleSizeChange = (itemId: number, newSize: string) => {
    if (onSizeChange) {
      onSizeChange(itemId, newSize)
    }
  }

  const handleDeleteItem = (itemId: number) => {
    setDeletedItems(prev => new Set([...prev, itemId]))
  }

  // Filter out deleted items
  const activeCartItems = cartItems.filter(item => !deletedItems.has(item.id))

  const subtotal = activeCartItems.reduce((total: number, item) => {
    return total + item.price * (quantities[item.id] || 1)
  }, 0)

  const discount = (subtotal * discountPercentage) / 100
  const delivery = activeCartItems.length === 0 || subtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const deliveryLabel = delivery === 0 ? 'Free Delivery' : `$${delivery}`

  const total = subtotal - discount + delivery

  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side='left'
        className='w-full gap-6 p-6 sm:max-w-131 [&>button]:top-7 [&>button]:right-6 [&>button>svg]:size-5'
      >
        <SheetHeader className='p-0'>
          <SheetTitle className='text-2xl'>Cart</SheetTitle>
          <SheetDescription hidden />
        </SheetHeader>
        <div className='flex flex-col justify-between'>
          {activeCartItems.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='text-muted-foreground text-lg font-medium'>Your cart is empty</div>
              <div className='text-muted-foreground mt-2 text-sm'>Refresh the page to restore items</div>
            </div>
          ) : (
            activeCartItems.map(item => (
              <div key={item.id} className='flex border-b pt-4 pb-7 max-sm:flex-col max-sm:gap-y-2 sm:items-center'>
                <div className='flex grow items-center gap-4'>
                  <div className='size-18.5 overflow-hidden rounded-lg border'>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <h4 className='font-medium'>{item.name}</h4>
                    <div className='flex items-center gap-2'>
                      {item.size === 'Free Style' ? (
                        <span className='text-accent-foreground border-input dark:bg-input/30 w-29 rounded-md border bg-transparent px-2.5 py-2.25 text-xs'>
                          {item.size}
                        </span>
                      ) : (
                        <Select defaultValue={item.size} onValueChange={value => handleSizeChange(item.id, value)}>
                          <SelectTrigger className='w-29 shadow-none'>
                            <SelectValue placeholder='Size' />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSizes.map((sizeItem, index: number) => (
                              <SelectItem key={`${sizeItem.value}-${index}`} value={sizeItem.value}>
                                {sizeItem.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Select
                        value={quantities[item.id]?.toString() || '1'}
                        onValueChange={value => handleQuantityChange(item.id, value)}
                      >
                        <SelectTrigger className='w-29 shadow-none'>
                          <SelectValue placeholder='Quantity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='1'>1</SelectItem>
                          <SelectItem value='2'>2</SelectItem>
                          <SelectItem value='3'>3</SelectItem>
                          <SelectItem value='4'>4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className='flex grow items-center gap-3 max-sm:justify-end sm:flex-col sm:items-end'>
                  <span className='text-lg font-semibold'>${(item.price * (quantities[item.id] || 1)).toFixed(2)}</span>
                  <Popover
                    open={openPopovers[item.id] || false}
                    onOpenChange={open => setOpenPopovers(prev => ({ ...prev, [item.id]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button variant='ghost' size='icon' className='cursor-pointer'>
                        <Trash2Icon className='size-6' />
                        <span className='sr-only'>Delete Item</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-80'>
                      <div className='flex flex-col items-center gap-4'>
                        <div className='flex aspect-square size-12 items-center justify-center rounded-full bg-red-500/10'>
                          <Trash2Icon className='text-destructive size-6' />
                        </div>
                        <div className='text-center font-semibold text-balance'>
                          Are you sure you want to remove this item
                        </div>
                        <div className='grid w-full grid-cols-2 gap-2'>
                          <Button
                            variant='secondary'
                            size='sm'
                            onClick={() => setOpenPopovers(prev => ({ ...prev, [item.id]: false }))}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => {
                              handleDeleteItem(item.id)
                              setOpenPopovers(prev => ({ ...prev, [item.id]: false }))
                            }}
                          >
                            Delete Item
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))
          )}
        </div>
        <SheetFooter className='p-0'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between gap-2.5'>
              <p className='text-muted-foreground'>Price</p>
              <p className='font-semibold'>${subtotal.toFixed(2)}</p>
            </div>
            <div className='flex items-center justify-between gap-2.5'>
              <p className='text-muted-foreground'>Discount</p>
              <p className='font-semibold'>-${discount.toFixed(2)}</p>
            </div>
            <div className='flex items-center justify-between gap-2.5'>
              <p className='text-muted-foreground'>Delivery Charges</p>
              <p className='font-semibold'>{deliveryLabel}</p>
            </div>
            <Separator />
            <div className='flex items-center justify-between gap-2.5'>
              <h5 className='grow text-lg font-semibold'>Total</h5>
              <p className='text-lg font-semibold'>${total.toFixed(2)}</p>
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-2'>
            <Button size='lg' className='w-full rounded-lg'>
              Checkout
            </Button>
            <Button size='lg' variant='outline' className='w-full rounded-lg'>
              Continue Shopping
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default ShoppingCart
