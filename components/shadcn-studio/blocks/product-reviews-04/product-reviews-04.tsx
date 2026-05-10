'use client'

import { useState } from 'react'

import { CircleCheckIcon, CircleXIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Rating } from '@/components/ui/rating'

type ProductReviewsProps = {
  reviewItems: {
    id: number
    image: string
    name: string
    verified: boolean
    rating: number
    description: string
    date: string
    reviewLiked: number
    reviewUnLiked: number
  }[]
}

const ProductReviews = ({ reviewItems }: ProductReviewsProps) => {
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: { liked: number; unliked: number } }>(() => {
    const initialCounts: { [key: number]: { liked: number; unliked: number } } = {}

    reviewItems.forEach(item => {
      initialCounts[item.id] = {
        liked: item.reviewLiked,
        unliked: item.reviewUnLiked
      }
    })

    return initialCounts
  })

  function handleClickLiked(itemId: number) {
    setLikeCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        liked: prev[itemId].liked + 1
      }
    }))
  }

  function handleClickUnLiked(itemId: number) {
    setLikeCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        unliked: prev[itemId].unliked + 1
      }
    }))
  }

  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto px-4 sm:max-w-5xl sm:px-6 lg:px-8'>
        <Card className='w-full border-0 shadow-none'>
          <CardContent className='space-y-8 px-0'>
            <div className='flex h-full gap-10 px-6 max-md:flex-wrap sm:items-center'>
              <div className='flex grow flex-col items-center'>
                <h5 className='mb-3 flex items-baseline justify-center text-4xl font-semibold'>
                  <span className='text-6xl font-semibold'>4</span> <span>/5</span>
                </h5>
                <Rating readOnly variant='yellow' size={24} value={4.5} precision={0.5} />
                <p className='mt-2 text-center font-medium'>Based on 65 verified reviews</p>
              </div>
              <div className='grow'>
                <div className='flex w-full items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='size-4 fill-amber-500/20 stroke-amber-500/20' />
                    <span className='text-sm font-semibold'>5</span>
                  </div>
                  <Progress value={100} className='h-2.5 w-54 [&>div]:bg-amber-600 dark:[&>div]:bg-amber-400/60' />
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='size-4 fill-amber-500/20 stroke-amber-500/20' />
                    <span className='text-sm font-semibold'>4</span>
                  </div>
                  <Progress value={75} className='h-2.5 w-54 [&>div]:bg-amber-600 dark:[&>div]:bg-amber-400/60' />
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='size-4 fill-amber-500/20 stroke-amber-500/20' />
                    <span className='text-sm font-semibold'>3</span>
                  </div>
                  <Progress value={50} className='h-2.5 w-54 [&>div]:bg-amber-600 dark:[&>div]:bg-amber-400/60' />
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='size-4 fill-amber-500/20 stroke-amber-500/20' />
                    <span className='text-sm font-semibold'>2</span>
                  </div>
                  <Progress value={25} className='h-2.5 w-54 [&>div]:bg-amber-600 dark:[&>div]:bg-amber-400/60' />
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <StarIcon className='size-4 fill-amber-500/20 stroke-amber-500/20' />
                    <span className='text-sm font-semibold'>1</span>
                  </div>
                  <Progress value={0} className='h-2.5 w-54 [&>div]:bg-amber-600 dark:[&>div]:bg-amber-400/60' />
                </div>
              </div>
              <div className='flex grow flex-col items-center gap-5'>
                <Button className='w-full'>Write a review</Button>
                <Button className='w-full' variant='outline'>
                  Ask a question
                </Button>
              </div>
            </div>
            <div className='space-y-2.5 p-5 px-6'>
              <h5 className='text-lg font-semibold'>Customer Photos & videos</h5>
              <div className='flex flex-wrap gap-8'>
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-9.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-8.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-7.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-6.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-5.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-4.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-reviews/image-3.png'
                  alt='T-shirt'
                  className='size-18 rounded-sm object-cover'
                />
              </div>
            </div>
            {reviewItems.map(item => (
              <div key={`${item.name}-${item.id}`}>
                <Separator />
                <div className='grid grid-cols-1 items-start gap-6 px-6 pt-8 md:grid-cols-8'>
                  <div className='flex items-center gap-4 md:col-span-2'>
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
                  <div className='space-y-3 pt-0.5 md:col-span-6'>
                    <Rating readOnly variant='yellow' size={16} value={item.rating} precision={0.5} />
                    <div>
                      <p className='text-muted-foreground'>{item.description} </p>
                      <p className='text-muted-foreground mt-1 font-medium'>{item.date} </p>
                    </div>

                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-2'>
                        <Button onClick={() => handleClickLiked(item.id)} variant='ghost' size='icon'>
                          <ThumbsUpIcon className='stroke-muted-foreground size-4.5' />
                        </Button>
                        <span className='text-muted-foreground font-semibold'>{likeCounts[item.id]?.liked}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button onClick={() => handleClickUnLiked(item.id)} variant='ghost' size='icon'>
                          <ThumbsDownIcon className='stroke-muted-foreground size-4.5' />
                        </Button>
                        <span className='text-muted-foreground font-semibold'>{likeCounts[item.id]?.unliked}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default ProductReviews
