'use client'

import { useState } from 'react'

import { Trash2Icon, XIcon, MinusIcon, PlusIcon } from 'lucide-react'
import { Button as AriaButton, Group, Input as ReactInput, NumberField } from 'react-aria-components'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type CheckoutProps = {
  checkoutItems: {
    id: number
    name: string
    variant: string
    price: number
    image: string
  }[]
  taxPercentage?: number
}

const Checkout = ({ checkoutItems }: CheckoutProps) => {
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initialQuantities: Record<number, number> = {}

    checkoutItems.forEach(item => {
      initialQuantities[item.id] = 1
    })

    return initialQuantities
  })

  const [deletedItems, setDeletedItems] = useState<Set<number>>(new Set())
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({})

  const handleQuantityChange = (itemId: number, value: number) => {
    const newQuantity = Math.max(1, value || 1)

    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }))
  }

  const handleDeleteItem = (itemId: number) => {
    setDeletedItems(prev => new Set([...prev, itemId]))
  }

  // Filter out deleted items
  const activeCheckoutItems = checkoutItems.filter(item => !deletedItems.has(item.id))

  const subtotal = activeCheckoutItems.reduce((total: number, item) => {
    return total + item.price * (quantities[item.id] || 1)
  }, 0)

  const [paymentMethod, setPaymentMethod] = useState('credit-card')

  const shippingCost = 599.0
  const discount = 50.0
  const total = subtotal + shippingCost - discount

  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left Column - cartItems */}
          <div className='lg:col-span-2'>
            <h2 className='mb-6 text-2xl font-semibold'>Shopping Cart</h2>
            <Card className='shadow-none lg:col-span-2'>
              <CardHeader className='flex w-full items-center justify-between border-b !pb-2'>
                <p className='font-medium max-sm:hidden'>Product</p>
                <div className='flex items-center justify-between gap-20 max-sm:hidden'>
                  <p className='font-medium max-sm:hidden'>Quantity</p>
                  <p className='font-medium max-sm:hidden'>Price</p>
                </div>

                <p className='font-medium sm:hidden'>Product Details</p>
              </CardHeader>
              <CardContent>
                {activeCheckoutItems.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <div className='text-muted-foreground text-lg font-medium'>Your cart is empty</div>
                    <div className='text-muted-foreground mt-2 text-sm'>Refresh the page to restore items</div>
                  </div>
                ) : (
                  <>
                    {activeCheckoutItems.map(item => (
                      <div key={item.id} className='flex flex-col gap-3'>
                        <div className='flex gap-6 max-sm:flex-col sm:items-center'>
                          <div className='flex grow gap-4'>
                            <Popover
                              open={openPopovers[item.id] || false}
                              onOpenChange={open => setOpenPopovers(prev => ({ ...prev, [item.id]: open }))}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='text-muted-foreground my-auto cursor-pointer'
                                >
                                  <XIcon className='size-6' />
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
                            <div className='size-18 shrink-0'>
                              <img src={item.image} alt={item.name} className='size-full rounded-md object-cover' />
                            </div>
                            <div className='space-y-4'>
                              <div className='flex flex-col gap-2'>
                                <h3>{item.name}</h3>
                                <p className='text-muted-foreground'>{item.variant}</p>
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-12'>
                            <NumberField
                              value={quantities[item.id] || 1}
                              onChange={value => handleQuantityChange(item.id, value)}
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
                                <ReactInput className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none' />
                                <AriaButton
                                  slot='increment'
                                  className='bg-primary/10 text-muted-foreground hover:bg-accent hover:text-foreground me-2 flex aspect-square h-5 items-center justify-center rounded-sm text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                  <PlusIcon className='size-3' />
                                  <span className='sr-only'>Increment</span>
                                </AriaButton>
                              </Group>
                            </NumberField>
                            <p className='text-xl font-semibold'>
                              ${(item.price * (quantities[item.id] || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <Separator
                          className={cn('mb-3', {
                            'mb-6': item.id === activeCheckoutItems.length
                          })}
                        />
                      </div>
                    ))}

                    <div className='grid grid-cols-1 items-center justify-between gap-x-11 gap-y-6 sm:grid-cols-2'>
                      {/* Coupon */}
                      <div className='flex flex-col gap-6'>
                        <div className='space-y-1.5'>
                          <p className='text-xl font-semibold'>Coupon Code</p>
                          <p className='text-muted-foreground'>Enter code to get discount instantly</p>
                        </div>
                        <div className='flex gap-3'>
                          <Input type='text' placeholder='Add discount code' className='h-10' />
                          <Button size='lg'>Apply</Button>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className='space-y-6'>
                        <div className='flex items-center justify-between gap-3'>
                          <span className='text-muted-foreground font-medium'>Subtotal</span>
                          <span className='font-medium'>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className='flex items-center justify-between gap-3'>
                          <span className='text-muted-foreground font-medium'>Shipping Cost</span>
                          <span className='font-medium'>${shippingCost.toFixed(2)}</span>
                        </div>
                        <div className='flex items-center justify-between gap-3'>
                          <span className='text-muted-foreground font-medium'>Discount</span>
                          <span className='font-medium'>${discount.toFixed(2)}</span>
                        </div>
                        <Separator className='mb-3' />
                        <div className='flex items-center justify-between gap-3 text-lg'>
                          <span className='font-medium'>Total Payable</span>
                          <span className='font-semibold'>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Payment Info</h2>
            <Card className='shadow-none'>
              <CardContent>
                <CardTitle className='mb-6 text-xl'>Payment Info</CardTitle>
                <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className='gap-6'>
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='credit-card' id='credit-card' className='size-5 [&_svg]:size-3' />
                    <Label htmlFor='credit-card'>Credit card</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='paypal' id='paypal' className='size-5 [&_svg]:size-3' />
                    <Label htmlFor='paypal'>Paypal</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='cod' id='cod' className='size-5 [&_svg]:size-3' />
                    <Label htmlFor='cod'>Cash on delivery</Label>
                  </div>
                </RadioGroup>

                <Separator className='my-6' />

                <div className='space-y-6'>
                  <div className='space-y-3.5'>
                    <Label className='text-base font-normal' htmlFor='card-name'>
                      Name on Card:
                    </Label>
                    <Input type='text' placeholder='John Joe' id='card-name' />
                  </div>

                  <div className='space-y-3.5'>
                    <Label className='text-base font-normal' htmlFor='card-number'>
                      Card Number
                    </Label>
                    <Input type='text' placeholder='0000 0000 0000 1235' id='card-number' />
                  </div>

                  <div className='flex gap-6'>
                    <div className='grow space-y-3.5'>
                      <Label className='text-base font-normal'>Expiration Date:</Label>
                      <div className='mt-2 flex gap-3.5'>
                        <Input type='text' placeholder='25' />
                        <Input type='text' placeholder='2027' />
                      </div>
                    </div>
                    <div className='space-y-3.5'>
                      <Label className='text-base font-normal' htmlFor='card-cvv'>
                        CVV
                      </Label>
                      <Input type='text' placeholder='248' id='card-cvv' />
                    </div>
                  </div>

                  <Button size='lg' className='w-full'>
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout
