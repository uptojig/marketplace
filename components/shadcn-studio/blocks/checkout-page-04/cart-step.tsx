'use client'

import { Fragment, useState } from 'react'

import { ArrowRightIcon, CheckCheckIcon, MinusIcon, PlusIcon, XIcon } from 'lucide-react'
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  NumberField as AriaNumberField
} from 'react-aria-components'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type {
  OrderItemType,
  StepperType
} from '@/components/shadcn-studio/blocks/checkout-page-04/checkout-page-04'
import { Rating } from '@/components/ui/rating'

const CartStep = ({ data, stepper }: { data: OrderItemType[]; stepper: StepperType }) => {
  const [isAlertVisible, setIsAlertVisible] = useState(true)

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
      <div className='flex flex-col gap-6 lg:col-span-2'>
        {isAlertVisible && (
          <Alert className='flex justify-between border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'>
            <CheckCheckIcon />
            <div className='flex flex-1 flex-col gap-0.5'>
              <AlertTitle>Available Offers</AlertTitle>
              <AlertDescription className='text-green-600/80 dark:text-green-400/80'>
                - 10% instant Discount on Bank of America Corp Bank and credit cards
              </AlertDescription>
              <AlertDescription className='text-green-600/80 dark:text-green-400/80'>
                - 25% cashback voucher of up to $60 on first ever Paypal Transaction. TCA
              </AlertDescription>
            </div>
            <button className='cursor-pointer' onClick={() => setIsAlertVisible(false)}>
              <XIcon className='size-5' />
              <span className='sr-only'>Close</span>
            </button>
          </Alert>
        )}
        <p className='front-medium text-lg'>My Shopping Bag (2 items)</p>
        <div className='flex flex-col gap-6 rounded-md border p-6'>
          {data.map((item, index) => (
            <Fragment key={index}>
              <div className='flex items-center gap-6 max-sm:flex-col'>
                <img src={item.image} alt={item.title} className='w-30' />
                <div className='flex flex-1 flex-col items-start gap-3 max-sm:items-center'>
                  <div className='flex flex-col items-start gap-1 max-sm:items-center'>
                    <p className='text-lg font-medium'>{item.title}</p>
                    <div className='flex flex-wrap items-center gap-1.5 max-sm:justify-center'>
                      <span className='text-muted-foreground font-medium'>Sold by:</span>
                      <span className='text-lg font-semibold'>{item.soldBy}</span>
                      <Badge className='h-5.5 rounded-sm border-none bg-green-600/10 font-normal text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                        In stock
                      </Badge>
                    </div>
                  </div>

                  <Rating readOnly variant='yellow' size={24} value={item.rating} precision={0.5} />

                  <AriaNumberField defaultValue={1} minValue={0} aria-label='Quantity'>
                    <AriaGroup className='dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-sm whitespace-nowrap transition-[color] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px]'>
                      <AriaButton
                        slot='decrement'
                        className='bg-primary/10 hover:bg-primary/20 ml-3 flex size-5 items-center justify-center rounded transition-[color] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <MinusIcon className='size-3' />
                        <span className='sr-only'>Decrement</span>
                      </AriaButton>
                      <AriaInput className='selection:bg-primary selection:text-primary-foreground w-15 px-3 py-2 text-center tabular-nums outline-none' />
                      <AriaButton
                        slot='increment'
                        className='bg-primary/10 hover:bg-primary/20 mr-3 flex size-5 items-center justify-center rounded transition-[color] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <PlusIcon className='size-3' />
                        <span className='sr-only'>Increment</span>
                      </AriaButton>
                    </AriaGroup>
                  </AriaNumberField>
                </div>
                <div className='flex flex-col items-end justify-center gap-5 max-sm:items-center'>
                  <div className='flex items-center gap-1.5 text-lg'>
                    <span className='font-semibold'>{`$${item.sellingPrice}/`}</span>
                    <span className='text-muted-foreground line-through'>{`$${item.mrp}`}</span>
                  </div>
                  <Button
                    size='sm'
                    className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20'
                  >
                    Move to wishlist
                  </Button>
                </div>
              </div>
              {index < data.length - 1 && <Separator />}
            </Fragment>
          ))}
        </div>
        <Button variant='outline' className='w-full justify-between' asChild>
          <a href='#'>
            Add more products from wishlist
            <ArrowRightIcon />
          </a>
        </Button>
      </div>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-8 rounded-md border p-6'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='multi-step-cart-offer' className='text-lg'>
              Offer
            </Label>
            <div className='flex rounded-md shadow-xs'>
              <Input
                id='multi-step-cart-offer'
                placeholder='Enter Promo Code'
                className='-me-px rounded-r-none shadow-none focus-visible:z-1'
              />
              <Button className='rounded-l-none'>Apply</Button>
            </div>
          </div>
          <div className='bg-muted flex flex-col items-start gap-3 rounded-md px-4 py-3'>
            <p className='font-medium'>Buying gift for a loved one?</p>
            <p className='text-muted-foreground'>Gift wrap and personalizes message on card, only for $2</p>
            <a href='#' className='font-semibold'>
              Add gift wrap 🎁
            </a>
          </div>
          <Separator />
          <div className='flex flex-col items-start gap-2'>
            <p className='text-lg font-medium'>Price Details</p>
            <div className='flex w-full flex-col gap-3'>
              <div className='flex items-center justify-between gap-4'>
                <p className='text-muted-foreground'>Price</p>
                <p className='text-right font-medium'>
                  {`$${data.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0).toFixed(2)}`}
                </p>
              </div>
              <div className='flex items-center justify-between gap-4'>
                <p className='text-muted-foreground'>Discount</p>
                <p className='text-right font-medium'>-$50.00</p>
              </div>
              <div className='flex items-center justify-between gap-4'>
                <p className='text-muted-foreground'>Delivery Charges</p>
                <p className='text-right font-medium'>Free Delivery</p>
              </div>
              <Separator />
              <div className='flex items-center justify-between gap-4'>
                <p className='text-lg font-medium'>Total</p>
                <p className='text-right font-semibold'>
                  {`$${(data.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0) - 50).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => stepper.navigation.next()}>Place Order</Button>
      </div>
    </div>
  )
}

export default CartStep
