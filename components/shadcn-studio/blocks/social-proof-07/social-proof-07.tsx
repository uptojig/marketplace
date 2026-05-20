import type { ReactElement } from 'react'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

type MetricItem = {
  icon: ReactElement
  value: string
  label: string
}

const SocialProof = ({ metrics }: { metrics: MetricItem[] }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='bg-muted rounded-md px-4 py-10 sm:px-6 lg:px-8'>
          <div className='mb-12 space-y-4 sm:mb-16 lg:mb-24'>
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Key Performance Metrics</h2>
            <p className='text-muted-foreground max-w-4xl text-xl'>
              Unlock your business potential with our expert guidance. Discover innovative strategies to elevate your
              success.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className='[&>svg]:text-muted-foreground flex flex-col items-center [&>svg]:size-7'>
                  {metric.icon}
                  <CardTitle className='mt-4 mb-3 text-2xl leading-10 font-semibold md:text-3xl lg:text-4xl'>
                    {metric.value}
                  </CardTitle>
                  <CardDescription className='text-xl font-medium'>{metric.label}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
