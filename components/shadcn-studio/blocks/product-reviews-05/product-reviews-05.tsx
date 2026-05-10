'use client'

import { useState, useId } from 'react'

import { CircleCheckIcon, CircleXIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import ProductReviewForm from '@/components/shadcn-studio/blocks/product-reviews-05/review-form'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Pagination, PaginationContent, PaginationItem, PaginationEllipsis } from '@/components/ui/pagination'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Rating } from '@/components/ui/rating'

import { usePagination } from '@/hooks/use-pagination'

type PaginationState = {
  pageIndex: number
  pageSize: number
}

type ProductReviewsProps = {
  reviewItems: {
    id: number
    image: string
    name: string
    verified: boolean
    rating: number
    title: string
    time: string
    description: string
    date: string
    helpfull: number
  }[]
}

const ProductReviews = ({ reviewItems }: ProductReviewsProps) => {
  const filterReviewId = useId()
  const filterTimeId = useId()

  const pageSize = 3

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  const [helpfullCount, setHelpfullCount] = useState<{ [key: number]: { helpfull: number; checked: boolean } }>(() => {
    const initialCounts: { [key: number]: { helpfull: number; checked: boolean } } = {}

    reviewItems.forEach(item => {
      initialCounts[item.id] = {
        helpfull: item.helpfull,
        checked: false
      }
    })

    return initialCounts
  })

  // Calculate current reviews based on pagination
  const totalPages = Math.ceil(reviewItems.length / pageSize)
  const startIndex = pagination.pageIndex * pagination.pageSize
  const endIndex = startIndex + pagination.pageSize
  const currentReviews = reviewItems.slice(startIndex, endIndex)

  // Use pagination hook
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: pagination.pageIndex + 1,
    totalPages,
    paginationItemsToDisplay: 5
  })

  // Pagination handlers
  const goToPage = (pageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex }))
  }

  const goToPreviousPage = () => {
    if (pagination.pageIndex > 0) {
      goToPage(pagination.pageIndex - 1)
    }
  }

  const goToNextPage = () => {
    if (pagination.pageIndex < totalPages - 1) {
      goToPage(pagination.pageIndex + 1)
    }
  }

  const canPreviousPage = pagination.pageIndex > 0
  const canNextPage = pagination.pageIndex < totalPages - 1

  function handleClickLiked(itemId: number) {
    setHelpfullCount(prev => ({
      ...prev,
      [itemId]: {
        helpfull: prev[itemId].checked ? prev[itemId].helpfull - 1 : prev[itemId].helpfull + 1,
        checked: !prev[itemId].checked
      }
    }))
  }

  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto px-4 sm:max-w-5xl sm:px-6 lg:px-8'>
        <Card className='w-full border-0 p-4 shadow-none md:p-6 lg:p-8'>
          <CardContent className='space-y-10 p-0'>
            <div className='space-y-6'>
              <div className='flex h-full gap-8 rounded-lg border p-6 max-md:flex-wrap sm:items-center'>
                <div className='flex grow flex-col'>
                  <h5 className='mb-3 text-4xl font-bold'>4/5</h5>
                  <p className='text-muted-foreground mt-2 font-medium'>Average rating</p>
                  <Rating readOnly variant='yellow' size={24} value={4.5} precision={0.5} />
                  <p className='mt-2 font-medium'>(3,657 reviews)</p>
                </div>
                <Separator orientation='vertical' className='bg-border !h-30 max-sm:hidden' />
                <Separator className='sm:hidden' />
                <div className='grow space-y-3'>
                  <h5 className='text-4xl font-bold'>100M+</h5>
                  <p className='text-muted-foreground font-medium'>Worldwide Clients</p>
                  <div className='flex gap-2.5'>
                    <img
                      src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-17.png'
                      alt='ford'
                      className='h-5 w-full object-contain'
                    />
                    <img
                      src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-18.png'
                      alt='visa'
                      className='h-5 w-full object-contain'
                    />
                    <img
                      src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-19.png'
                      alt='bmw'
                      className='h-5 w-full object-contain'
                    />
                  </div>
                </div>
                <Separator orientation='vertical' className='bg-border !h-30 max-md:hidden' />
                <Separator className='md:hidden' />
                <div className='flex flex-col gap-3'>
                  <h5 className='text-lg font-semibold'>Do you own or have you used the product?</h5>
                  <p className='text-muted-foreground'>Give your opinion by rating the product</p>
                  <div className='flex items-center gap-2'>
                    <Rating readOnly size={24} value={0} precision={0.5} />
                    <span className='font-medium'>Give a Note</span>
                  </div>
                  <Button className='w-fit rounded-lg px-3 py-1.5'>Write a Customer review</Button>
                </div>
              </div>
              <div className='flex items-end gap-5'>
                <div className='text-muted-foreground grow'>
                  Showing <span className='font-semibold'>5,768</span> Customer Reviews
                </div>
                <Select defaultValue='all review'>
                  <SelectTrigger id={filterReviewId} className='w-35'>
                    <SelectValue placeholder='Select a fruit' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Filter Review</SelectLabel>
                      <SelectItem value='all review'>All Review</SelectItem>
                      <SelectItem value='positive review'>Positive Review</SelectItem>
                      <SelectItem value='negative review'>Negative Review</SelectItem>
                      <SelectItem value='verified review'>Verified Review</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select defaultValue='recently Added'>
                  <SelectTrigger id={filterTimeId} className='w-40'>
                    <SelectValue placeholder='Select a fruit' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Filter by time</SelectLabel>
                      <SelectItem value='recently Added'>Recently Added</SelectItem>
                      <SelectItem value='a week ago'>a Week Ago</SelectItem>
                      <SelectItem value='a month ago'>A Month Ago</SelectItem>
                      <SelectItem value='6 month ago'>6 Month Ago</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {currentReviews.map(item => (
                <div key={`${item.name}-${item.id}`}>
                  <Separator />
                  <div className='mt-6 space-y-2.5'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='rounded-ful size-10'>
                        <AvatarImage src={item.image} alt={item.name} />
                        <AvatarFallback className='text-xs'>{item.name}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col gap-1'>
                        <h5 className='font-semibold'>{item.name}</h5>
                        {item.verified ? (
                          <div className='flex items-center gap-1'>
                            <CircleCheckIcon className='size-4 stroke-green-500' />
                            <span className='text-muted-foreground'>Verified</span>
                          </div>
                        ) : (
                          <div className='flex items-center gap-1'>
                            <CircleXIcon className='stroke-destructive size-4' />
                            <span className='text-muted-foreground'>Not Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='space-y-2.5'>
                      <h4 className='text-lg font-medium'>{item.title}</h4>
                      <div className='flex items-center gap-3'>
                        <Rating readOnly variant='yellow' size={16} value={item.rating} precision={0.5} />
                        <span className='text-muted-foreground font-medium'>
                          {item.date} at {item.time}
                        </span>
                      </div>
                      <p className='text-muted-foreground'>{item.description} </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Button
                        onClick={() => handleClickLiked(item.id)}
                        variant={helpfullCount[item.id]?.checked ? 'default' : 'outline'}
                      >
                        Helpful ({helpfullCount[item.id]?.helpfull})
                      </Button>
                      <Dialog>
                        <form>
                          <DialogTrigger asChild>
                            <Button variant='ghost'>Report</Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-[425px]'>
                            <DialogHeader>
                              <DialogTitle>Report</DialogTitle>
                              <DialogDescription>Report the user.</DialogDescription>
                            </DialogHeader>
                            <Textarea placeholder='Type your message here.' className='w-full' />
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant='outline'>Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button type='submit'>Save changes</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </form>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
              <div className='space-y-3.5'>
                <Separator />
                <div className='flex items-center justify-between gap-3 max-sm:flex-col md:max-lg:flex-col'>
                  <p className='text-muted-foreground whitespace-nowrap' aria-live='polite'>
                    Showing <span className='text-primary'>{startIndex + 1}</span> to{' '}
                    <span className='text-primary'>{Math.min(endIndex, reviewItems.length)}</span> of{' '}
                    <span className='text-primary'>{reviewItems.length}</span> Reviews
                  </p>
                  <div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            className='disabled:pointer-events-none disabled:opacity-50'
                            variant={'ghost'}
                            onClick={goToPreviousPage}
                            disabled={!canPreviousPage}
                            aria-label='Go to previous page'
                          >
                            <ChevronLeftIcon aria-hidden='true' />
                            Previous
                          </Button>
                        </PaginationItem>
                        {showLeftEllipsis && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        {pages.map(page => {
                          const isActive = page === pagination.pageIndex + 1

                          return (
                            <PaginationItem key={page}>
                              <Button
                                size='icon'
                                variant={isActive ? 'default' : 'ghost'}
                                className={`${!isActive && 'text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 bg-transparent'}`}
                                onClick={() => goToPage(page - 1)}
                                aria-current={isActive ? 'page' : undefined}
                              >
                                {page}
                              </Button>
                            </PaginationItem>
                          )
                        })}
                        {showRightEllipsis && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <Button
                            className='disabled:pointer-events-none disabled:opacity-50'
                            variant={'ghost'}
                            onClick={goToNextPage}
                            disabled={!canNextPage}
                            aria-label='Go to next page'
                          >
                            Next
                            <ChevronRightIcon aria-hidden='true' />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
                <Separator />
              </div>
            </div>
            <div className='bg-muted rounded-md p-6'>
              <ProductReviewForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default ProductReviews
