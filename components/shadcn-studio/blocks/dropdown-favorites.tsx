'use client'

import type { ReactNode } from 'react'

import { Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
  data: {
    image: string
    title: string
    subtitle: string
    price: string
    oldPrice: string
  }[]
}

const FavoritesDropdown = ({ defaultOpen, align, trigger, data }: Props) => {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='flex w-80 flex-col gap-3 p-3' align={align || 'end'}>
        <DropdownMenuLabel className='text-muted-foreground p-0 text-base font-normal'>Favorites</DropdownMenuLabel>
        {data.map(item => (
          <DropdownMenuItem
            key={item.title}
            onClick={e => e.preventDefault()}
            className='items-start gap-4 p-0 text-base focus:bg-transparent'
          >
            <div className='bg-muted overflow-hidden rounded-sm'>
              <img src={item.image} alt={item.title} className='size-25' />
            </div>
            <div className='flex flex-1 flex-col items-start'>
              <p className='font-medium'>{item.title}</p>
              <p className='text-muted-foreground mb-4 text-sm'>{item.subtitle}</p>
              <div className='flex items-center gap-2'>
                <div className='text-xl font-semibold'>{item.price}</div>
                <div className='text-muted-foreground line-through'>{item.oldPrice}</div>
              </div>
            </div>
            <Button className='bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 size-7'>
              <Trash2Icon className='text-inherit' />
            </Button>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className='p-0 focus:bg-transparent'>
          <Button className='w-full'>View All Favorites</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FavoritesDropdown
