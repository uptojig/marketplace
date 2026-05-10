import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type OrderSummaryProps = {
  className?: string
  data: {
    id: string
    name: string
    color: string
    size: string
    price: number
    image: string
    quantity: number
  }[]
  orderID: string
}

const OrderSummary = ({ className, data, orderID }: OrderSummaryProps) => {
  return (
    <section className={cn('bg-muted py-8 sm:py-16 lg:py-24', className)}>
      <div className='mx-auto px-4 sm:max-w-296 sm:px-6 lg:px-8'>
        <Card className='w-full gap-10'>
          <div className='flex justify-between gap-6 px-6 max-md:flex-col md:items-center'>
            <CardHeader className='grow gap-5 px-0'>
              <CardTitle className='text-2xl'>Order Details</CardTitle>
              <CardDescription className='text-lg font-medium'>Your order will be with soon</CardDescription>
            </CardHeader>
            <div className='text-muted-foreground flex flex-col items-end gap-5'>
              <p>Order Number: #{orderID}</p>
              <p>
                Order Placement:{' '}
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-3 gap-3 border-b py-6 max-md:hidden'>
              <p className='text-lg font-medium'>Item</p>
              <div className='grid grid-cols-2 gap-16 text-center text-lg font-medium'>
                <p>Quantity</p>
                <p>Price</p>
              </div>
              <p className='text-end text-lg font-medium'>Delivery Expected</p>
            </div>
            {data.map(item => (
              <div
                key={item.id}
                className={cn('grid gap-3 pb-6 md:grid-cols-3', {
                  'border-b': data.indexOf(item) !== data.length - 1
                })}
              >
                <div className='flex items-center gap-4'>
                  <img src={item.image} alt={item.name} className='size-18 shrink-0 rounded-md' />
                  <div className='flex flex-col gap-2'>
                    <p className='font-medium'>{item.name}</p>
                    <div className='text-muted-foreground flex gap-6'>
                      <p>Color : {item.color}</p>
                      <p>Size : {item.size}</p>
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-2 items-center gap-16 font-medium md:text-center'>
                  <p>Qty: {item.quantity}</p>
                  <p className='max-md:text-end'>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <p className='text-muted-foreground flex items-center justify-end'>
                  {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}

            <CardFooter className='grid items-center gap-y-6 px-0 md:grid-cols-2'>
              <div className='grid grid-cols-2 gap-6'>
                <Button size='lg'>Track Your Order</Button>
                <Button size='lg' variant='secondary'>
                  Cancel Order
                </Button>
              </div>
              <div className='text-end'>
                <p className='font-semibold'>
                  Total: ${data.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                </p>
              </div>
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default OrderSummary
