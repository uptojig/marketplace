'use client'

import type { ReactNode } from 'react'

import { HeartIcon, StarIcon, Trash2Icon, TruckIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
  data: {
    companySrc: string
    companyName: string
    freeShipping: boolean
    discount: number
    productSrc: string
    productName: string
    oldPrice: number
    price: number
    color: string
    size: string
    rating: number
    quantity: number
  }[]
}

const CartDropdown = ({ defaultOpen, align, trigger, data }: Props) => {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='flex w-xs flex-col gap-3 p-3 sm:w-100' align={align || 'end'}>
        <DropdownMenuLabel className='text-muted-foreground flex items-center justify-between p-0 text-base font-normal'>
          <span>My Cart (3)</span>
          <span className='text-foreground font-medium'>View All</span>
        </DropdownMenuLabel>
        {data.map(item => (
          <DropdownMenuItem
            key={item.productName}
            onClick={e => e.preventDefault()}
            className='flex-col items-start gap-0 border px-3 py-2.5 text-base focus:bg-transparent'
          >
            <div className='flex w-full flex-wrap items-center justify-between gap-2'>
              <div className='flex items-center gap-3'>
                <img src={item.companySrc} alt={item.companyName} className='size-8 rounded-full' />
                <span className='font-semibold'>{item.companyName}</span>
              </div>
              <div className='flex items-center gap-2'>
                {item.freeShipping && (
                  <Badge className='rounded-sm bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'>
                    <TruckIcon className='size-3 text-inherit' />
                    Free Shipping
                  </Badge>
                )}
                {item.discount > 0 && (
                  <Badge className='rounded-sm bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400'>
                    {`Disc. ${item.discount}%`}
                  </Badge>
                )}
              </div>
            </div>
            <Separator className='my-3' />
            <div className='flex w-full gap-4'>
              <img src={item.productSrc} alt={item.productName} className='size-15 rounded-md' />
              <div className='flex flex-1 flex-col items-start gap-1'>
                <p className='font-medium'>{item.productName}</p>
                <div className='flex items-center gap-2.5'>
                  <div className='text-muted-foreground text-sm line-through'>{`$${item.oldPrice}`}</div>
                  <div className='font-medium'>{`$${item.price}`}</div>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='text-muted-foreground'>{`${item.color}: ${item.size}`}</div>
                  <StarIcon className='fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400' />
                  <div className='text-muted-foreground font-medium'>{item.rating.toFixed(1)}</div>
                </div>
                <Select defaultValue={item.quantity.toString()}>
                  <SelectTrigger className='!h-7 w-15'>
                    <SelectValue placeholder='Size' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='1'>1</SelectItem>
                      <SelectItem value='2'>2</SelectItem>
                      <SelectItem value='3'>3</SelectItem>
                      <SelectItem value='4'>4</SelectItem>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='6'>6</SelectItem>
                      <SelectItem value='7'>7</SelectItem>
                      <SelectItem value='8'>8</SelectItem>
                      <SelectItem value='9'>9</SelectItem>
                      <SelectItem value='10'>10</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex flex-col gap-2.5'>
                <Button variant='outline' size='icon' className='size-7'>
                  <HeartIcon />
                </Button>
                <Button variant='outline' size='icon' className='size-7'>
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <div className='grid grid-cols-2 gap-4'>
          <Button size='lg' variant='outline' className='w-full'>
            Add to Wishlist
          </Button>
          <Button size='lg' className='w-full'>
            Buy Now
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CartDropdown
