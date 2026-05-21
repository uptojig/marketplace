'use client'

import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type FAQItem = {
  question: string
  answer: string
}

type FAQComponentProps = {
  faqItems: FAQItem[]
}

const FAQ = ({ faqItems }: FAQComponentProps) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16'>
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className='space-y-4'>
              <Badge variant='outline' className='h-auto text-sm font-normal'>
                FAQS
              </Badge>
              <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Discover the Most common Questions</h2>
              <p className='text-muted-foreground text-xl leading-relaxed'>
                We&apos;ve gathered the questions we hear most often and answered them to help you make informed
                decisions.
              </p>
            </div>
          </motion.div>

          {/* Right Column - FAQ Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className='flex justify-end'
          >
            <div className='space-y-7 lg:w-[80%]'>
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                >
                  <Card className='hover:shadow-lg'>
                    <CardContent className='space-y-4'>
                      <h3 className='text-xl font-medium'>{item.question}</h3>
                      <p className='text-muted-foreground text-base leading-relaxed'>{item.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Check All Questions Link */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.9 + faqItems.length * 0.15
                }}
              >
                <Button size='sm' variant='link' className='px-0 text-base underline' asChild>
                  <a href='#'>Check All Common Questions</a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
