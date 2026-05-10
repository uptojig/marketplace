'use client'

import { useState } from 'react'

import { ListFilterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const SortByDropdownMenu = () => {
  const [value, setValue] = useState('name')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon-sm'
          className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 rounded-full'
        >
          <ListFilterIcon />
          <span className='sr-only'>Toggle filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-46'>
        <DropdownMenuLabel>Sort By:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          <DropdownMenuRadioItem value='name' className='pl-7.5'>
            Name
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='price-up' className='pl-7.5'>
            Price: Low to High
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='price-down' className='pl-7.5'>
            Price: High to Low
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SortByDropdownMenu
