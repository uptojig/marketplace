import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine
} from '@/components/ui/timeline'
import { cn } from '@/lib/utils'

type OrderSummaryProps = {
  className?: string
  orderID: number
  summaryData: {
    id: string
    name: string
    description: string
    image: string
    price: number
    quantity: number
  }[]
  customerName: string
  customerMail: string
  customerAddress: string
  customerPhone: string
}

const OrderSummary = ({
  className,
  orderID,
  summaryData,
  customerName,
  customerMail,
  customerAddress,
  customerPhone
}: OrderSummaryProps) => {
  const shipmentCost = 19
  const subtotal = summaryData.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <section className={cn('bg-muted py-8 sm:py-16 lg:py-24', className)}>
      <div className='mx-auto px-4 sm:max-w-2xl sm:px-6 lg:px-8'>
        <Card className='w-full gap-10'>
          <div className='flex justify-between gap-6 px-6 max-md:flex-col md:items-center'>
            <div className='flex items-center gap-1.5'>
              <span className='text-lg font-semibold'>Order:</span>
              <span className='text-muted-foreground'>{orderID}</span>
            </div>
            <div className='flex items-center gap-4'>
              <Button variant='outline' className='max-md:grow'>
                Invoice
              </Button>
              <Button className='max-md:grow'>Track order</Button>
            </div>
          </div>
          <CardContent className='space-y-6'>
            <Tabs defaultValue='summary' className='gap-6'>
              <TabsList className='w-full rounded-none border-b p-0'>
                <TabsTrigger
                  value='summary'
                  className='bg-card data-[state=active]:border-primary dark:data-[state=active]:bg-background dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent focus-visible:z-10 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none'
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value='payment'
                  className='bg-card data-[state=active]:border-primary dark:data-[state=active]:bg-background dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent focus-visible:z-10 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none'
                >
                  Payment
                </TabsTrigger>
                <TabsTrigger
                  value='delivery'
                  className='bg-card data-[state=active]:border-primary dark:data-[state=active]:bg-background dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent focus-visible:z-10 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none'
                >
                  Delivery
                </TabsTrigger>
              </TabsList>

              <TabsContent value='summary' className='space-y-6'>
                <div className='-mx-6 space-y-8 border-b px-6 pb-6'>
                  {summaryData.map(content => (
                    <div key={content.id} className='flex justify-between gap-2 max-md:flex-col md:items-center'>
                      <div className='flex gap-6 md:items-center'>
                        <div className='size-21.5 shrink-0 rounded-md border p-2.5'>
                          <img src={content.image} alt={content.name} />
                        </div>
                        <div className='flex flex-col gap-1.5'>
                          <span className='text-lg font-medium'>{content.name}</span>
                          <span className='text-muted-foreground'>{content.description}</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-5 max-md:justify-between md:flex-col md:items-end'>
                        <span className='text-lg font-medium'>${(content.price * content.quantity).toFixed(2)}</span>
                        <span className='text-muted-foreground'>Qty:{content.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex w-full justify-between'>
                  <span className='text-muted-foreground'>Subtotal:</span>
                  <span className='font-medium'>${subtotal.toFixed(2)}</span>
                </div>
                <Separator />
                <div className='flex w-full justify-between'>
                  <span className='text-muted-foreground'>Shipment cost:</span>
                  <span className='font-medium'>${shipmentCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className='flex w-full justify-between text-lg font-semibold'>
                  <span>Total:</span>
                  <span>${(subtotal + shipmentCost).toFixed(2)}</span>
                </div>
              </TabsContent>

              <TabsContent value='payment' className='space-y-6'>
                <div className='-mx-6 space-y-4 border-b px-6 pb-6'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>Name</span>
                    <span className='font-semibold'>{customerName}</span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>Email Address</span>
                    <span className='font-semibold'>{customerMail}</span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>Phone Number</span>
                    <span className='font-semibold'>{customerPhone}</span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>Address</span>
                    <span className='max-w-55 font-semibold'>{customerAddress}</span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-muted-foreground'>Payment Method</span>
                    <img
                      src='https://cdn.shadcnstudio.com/ss-assets/brand-logo/master.png'
                      alt='mastercard'
                      className='w-6.5'
                    />
                  </div>
                </div>

                <div className='flex w-full justify-between'>
                  <span className='text-muted-foreground'>Subtotal:</span>
                  <span className='font-medium'>${subtotal.toFixed(2)}</span>
                </div>
                <Separator />
                <div className='flex w-full justify-between'>
                  <span className='text-muted-foreground'>Shipment cost:</span>
                  <span className='font-medium'>${shipmentCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className='flex w-full justify-between text-lg font-semibold'>
                  <span>Total:</span>
                  <span>${(subtotal + shipmentCost).toFixed(2)}</span>
                </div>
              </TabsContent>

              <TabsContent value='delivery' className='space-y-6'>
                <Timeline>
                  <TimelineItem status='done' className='gap-x-4'>
                    <TimelineDot status='done' />
                    <TimelineLine done />
                    <TimelineHeading className='flex w-full justify-between text-wrap max-md:flex-col-reverse md:items-center'>
                      <span>Order was placed (Order ID: #{orderID})</span>
                      <span className='text-muted-foreground text-sm'>Tuesday 11:29 AM</span>
                    </TimelineHeading>
                    <TimelineContent className='text-muted-foreground'>
                      Your order has been placed successfully
                    </TimelineContent>
                  </TimelineItem>
                  <TimelineItem status='done' className='gap-x-4'>
                    <TimelineDot status='done' />
                    <TimelineLine done />
                    <TimelineHeading className='flex w-full justify-between text-wrap max-md:flex-col-reverse md:items-center'>
                      <span>Pick-up</span>
                      <span className='text-muted-foreground text-sm'>Wednesday 11:29 AM</span>
                    </TimelineHeading>
                    <TimelineContent className='text-muted-foreground'>Pick-up scheduled with courier</TimelineContent>
                  </TimelineItem>
                  <TimelineItem status='done' className='gap-x-4'>
                    <TimelineDot status='done' />
                    <TimelineLine done />
                    <TimelineHeading className='flex w-full justify-between text-wrap max-md:flex-col-reverse md:items-center'>
                      <span>Dispatched</span>
                      <span className='text-muted-foreground text-sm'>Thursday 11:29 AM</span>
                    </TimelineHeading>
                    <TimelineContent className='text-muted-foreground'>
                      Item has been picked up by courier
                    </TimelineContent>
                  </TimelineItem>
                  <TimelineItem status='done' className='gap-x-4'>
                    <TimelineDot status='done' />
                    <TimelineLine done />
                    <TimelineHeading className='flex w-full justify-between text-wrap max-md:flex-col-reverse md:items-center'>
                      <span>Package arrived</span>
                      <span className='text-muted-foreground text-sm'>Saturday 15:20 AM</span>
                    </TimelineHeading>
                    <TimelineContent className='text-muted-foreground'>
                      Package arrived at an Amazon facility, NY
                    </TimelineContent>
                  </TimelineItem>
                  <TimelineItem status='done' className='gap-x-4'>
                    <TimelineDot status='done' />
                    <TimelineLine />
                    <TimelineHeading className='flex w-full justify-between text-wrap max-md:flex-col-reverse md:items-center'>
                      <span>Dispatched for delivery</span>
                      <span className='text-muted-foreground text-sm'>Today 14:12 PM</span>
                    </TimelineHeading>
                    <TimelineContent className='text-muted-foreground'>
                      Package has left an Amazon facility, NY
                    </TimelineContent>
                  </TimelineItem>
                  <TimelineItem className='gap-x-4'>
                    <TimelineDot status='default' />
                    <TimelineHeading>Delivery</TimelineHeading>
                    <TimelineContent className='text-muted-foreground'>
                      Package will be delivered by tomorrow
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default OrderSummary
