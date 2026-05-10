'use client'

import { Fragment } from 'react'

import * as Stepperize from '@stepperize/react'
import { ChevronRightIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import MultiStep03CartSVG from '@/assets/svg/cart'
import MultiStep03AddressSVG from '@/assets/svg/address'
import MultiStep03PaymentSVG from '@/assets/svg/payment'
import MultiStep03ConfirmationSVG from '@/assets/svg/confirmation'
import CartStep from '@/components/shadcn-studio/blocks/checkout-page-04/cart-step'
import AddressStep from '@/components/shadcn-studio/blocks/checkout-page-04/address-step'
import PaymentStep from '@/components/shadcn-studio/blocks/checkout-page-04/payment-step'
import ConfirmationStep from '@/components/shadcn-studio/blocks/checkout-page-04/confirmation-step'

const { useStepper } = Stepperize.defineStepper(
  { id: 'multi-step-3-cart', title: 'Cart', icon: MultiStep03CartSVG },
  { id: 'multi-step-3-address', title: 'Address', icon: MultiStep03AddressSVG },
  { id: 'multi-step-3-payment', title: 'Payment', icon: MultiStep03PaymentSVG },
  { id: 'multi-step-3-confirmation', title: 'Confirmation', icon: MultiStep03ConfirmationSVG },
  { id: 'multi-step-3-complete', title: 'Submitted', icon: <></> }
)

export type StepperType = ReturnType<typeof useStepper>

export type OrderItemType = {
  image: string
  title: string
  soldBy: string
  isInStock: boolean
  sellingPrice: number
  mrp: number
  quantity: number
  rating: number
  estimatedDeliveryDate: string
}

const data: OrderItemType[] = [
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/register-multi-steps/image-2.png',
    title: 'iPhone 16 Pro Max',
    soldBy: 'Apple',
    isInStock: true,
    sellingPrice: 299,
    mrp: 359,
    quantity: 1,
    rating: 4.5,
    estimatedDeliveryDate: `December 31, ${new Date().getFullYear()}`
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/register-multi-steps/image-1.png',
    title: 'HomePod',
    soldBy: 'Apple',
    isInStock: true,
    sellingPrice: 249,
    mrp: 299,
    quantity: 1,
    rating: 4.5,
    estimatedDeliveryDate: `December 31, ${new Date().getFullYear()}`
  }
]

const Checkout = () => {
  const stepper = useStepper()
  const currentStep = stepper.lookup.getIndex(stepper.state.current.data.id)

  return (
    <div className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <Card className='border-none shadow-none'>
          <CardContent>
            <nav aria-label='Multi Steps'>
              <ol className='flex justify-center gap-x-6 gap-y-6 max-sm:flex-col sm:items-center md:gap-x-12'>
                {stepper.state.all
                  .filter(step => step.id !== 'multi-step-3-complete')
                  .map((step, index, array) => (
                    <Fragment key={step.id}>
                      <li>
                        <div
                          className={cn('flex h-auto w-full shrink-0 items-center justify-start gap-5 sm:flex-col', {
                            'text-muted-foreground hover:text-muted-foreground': index > currentStep,
                            'text-foreground': index <= currentStep
                          })}
                        >
                          <step.icon className='size-14' />
                          <span className='text-xl font-medium'>{step.title}</span>
                        </div>
                      </li>
                      {index < array.length - 1 && (
                        <li className='max-sm:hidden'>
                          <ChevronRightIcon className='size-4 shrink-0' />
                        </li>
                      )}
                    </Fragment>
                  ))}
              </ol>
            </nav>
            <Separator className='my-6' />
            {stepper.flow.switch({
              'multi-step-3-cart': () => <CartStep data={data} stepper={stepper} />,
              'multi-step-3-address': () => <AddressStep data={data} stepper={stepper} />,
              'multi-step-3-payment': () => <PaymentStep data={data} stepper={stepper} />,
              'multi-step-3-confirmation': () => <ConfirmationStep data={data} />
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Checkout
