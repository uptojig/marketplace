'use client'

import { Area, AreaChart, XAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const areaChartData = [
  { day: 'Monday', engagement: 250 },
  { day: 'Tuesday', engagement: 320 },
  { day: 'Wednesday', engagement: 250 },
  { day: 'Thursday', engagement: 540 },
  { day: 'Friday', engagement: 330 },
  { day: 'Saturday', engagement: 420 },
  { day: 'Sunday', engagement: 350 }
]

const areaChartConfig = {
  engagement: {
    label: 'Balance'
  }
} satisfies ChartConfig

const ChartBalance = () => {
  return (
    <ChartContainer config={areaChartConfig} className='h-38 w-full'>
      <AreaChart
        data={areaChartData}
        margin={{
          left: 20,
          right: 20
        }}
        className='stroke-2'
      >
        <defs>
          <linearGradient id='fillEngagement' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='10%' stopColor='var(--primary)' stopOpacity={0.5} />
            <stop offset='90%' stopColor='var(--primary)' stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey='day'
          orientation='top'
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tickFormatter={value => value.slice(0, 2)}
          className='text-muted-foreground text-sm uppercase'
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Area
          dataKey='engagement'
          type='natural'
          fill='url(#fillEngagement)'
          stroke='var(--primary)'
          stackId='a'
          style={{ marginInline: -24 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default ChartBalance
