'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export type PricingTierType = {
  id: string
  collection: string
  description: string
  price: number
  defaultChecked: boolean
}

export type CountriesDataType = {
  value: string
  label: string
}

const ShoppingCart = ({
  pricingTier,
  countries
}: {
  pricingTier: PricingTierType[]
  countries: CountriesDataType[]
}) => {
  const [selectedItemId, setSelectedItemId] = useState(pricingTier[0]?.id || '')
  const selectedCollectionPrice = pricingTier.find(item => item.id === selectedItemId)?.price.toFixed(2) || 0
  const vatValue = (Number(selectedCollectionPrice) * 0.2).toFixed(2) // Assuming a VAT rate of 20%
  const totalPrice = (Number(selectedCollectionPrice) + Number(vatValue)).toFixed(2)

  const [form, setForm] = useState({
    email: '',
    cardDetail: '',
    cardHolder: '',
    country: '',
    state: '',
    zip: '',
    vat: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleCountryChange = (value: string) => {
    setForm({ ...form, country: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(form)
  }

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 items-center gap-20 lg:grid-cols-2'>
          {/* Left Column - pricingTier */}
          <div className='bg-card space-y-9 rounded-xl border p-6'>
            <div>
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/shopping-cart/image-8.png'
                alt='product'
                className='mb-6 size-full rounded-md object-contain'
              />
              <div className='mb-4 flex items-center gap-6'>
                <div className='grow text-xl font-semibold'>The ultimate design system for figma</div>
                <div className='text-xl font-semibold'>${selectedCollectionPrice}</div>
              </div>
              <p className='text-muted-foreground'>
                The Ultimate Design & Development System for Figma is a cutting-edge UI/UX design framework that
                seamlessly integrates with Figma, empowering designers and developers to create high-quality digital
                products efficiently.
              </p>
            </div>
            <div>
              <RadioGroup
                className='w-full gap-6'
                defaultValue='collection-02'
                value={selectedItemId}
                onValueChange={setSelectedItemId}
              >
                {pricingTier.map(item => (
                  <div
                    key={item.id}
                    className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-3 rounded-md border p-4 outline-none'
                  >
                    <RadioGroupItem
                      value={item.id}
                      id={item.id}
                      aria-label='plan-radio-basic'
                      aria-describedby={item.id}
                      className='size-6 after:absolute after:inset-0 [&_svg]:size-4'
                    />
                    <div className='flex grow flex-col gap-2'>
                      <Label htmlFor={item.id} className='justify-between text-sm'>
                        {item.collection}{' '}
                        <span className='text-muted-foreground font-normal'>${item.price.toFixed(2)}</span>
                      </Label>
                      <p id={item.id} className='text-muted-foreground text-sm'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          {/* Right Column - Payment */}
          <div className='space-y-9'>
            <div className='space-y-2'>
              <h4 className='text-xl font-semibold'>Payment Details</h4>
              <p className='text-muted-foreground'>Complete your purchase by providing your payment details.</p>
            </div>
            <form onSubmit={handleSubmit}>
              {/* email Input */}
              <div className='mt-6 w-full space-y-2'>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  type='email'
                  id='email'
                  className='h-9.5'
                  placeholder='shadcnstudio@example.com'
                />
              </div>

              {/* Card Input */}
              <div className='mt-6 w-full space-y-2'>
                <Label htmlFor='card'>Card details</Label>
                <Input
                  name='cardDetail'
                  value={form.cardDetail}
                  onChange={handleChange}
                  type='text'
                  id='card'
                  className='h-9.5'
                  placeholder='123 456 85'
                />
              </div>

              {/* Card holder Input */}
              <div className='mt-6 w-full space-y-2'>
                <Label htmlFor='card-holder'>Card holder name</Label>
                <Input
                  name='cardHolder'
                  value={form.cardHolder}
                  onChange={handleChange}
                  type='text'
                  id='card-holder'
                  className='h-9.5'
                  placeholder='Adam Smith'
                />
              </div>

              {/* Billing Address */}
              <div className='mt-6 w-full space-y-2'>
                <Label htmlFor='country'>Billing Address</Label>
                <Select value={form.country} onValueChange={handleCountryChange}>
                  <SelectTrigger id='country' className='mb-0 w-full rounded-b-none shadow-none'>
                    <SelectValue placeholder='Select Country' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {countries.map(country => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className='-mt-px flex w-full items-center'>
                  <div className='w-full'>
                    <Label htmlFor='zip-code' className='sr-only'>
                      zip
                    </Label>
                    <Input
                      name='zip'
                      value={form.zip}
                      onChange={handleChange}
                      type='text'
                      id='zip-code'
                      className='h-9.5 rounded-none rounded-es-md border-e-0 focus:border-e-1'
                      placeholder='Zip'
                    />
                  </div>
                  <div className='w-full'>
                    <Label htmlFor='state' className='sr-only'>
                      state
                    </Label>
                    <Input
                      name='state'
                      value={form.state}
                      onChange={handleChange}
                      type='text'
                      id='state'
                      className='h-9.5 rounded-none rounded-ee-md'
                      placeholder='State'
                    />
                  </div>
                </div>
              </div>

              {/* VAT Number Input */}
              <div className='mt-6 space-y-2'>
                <Label htmlFor='vat-number'>VAT Number</Label>
                <Input
                  name='vat'
                  value={form.vat}
                  onChange={handleChange}
                  type='text'
                  id='vat-number'
                  className='h-9.5'
                  placeholder='GB01234568'
                />
              </div>

              <div className='mt-9 space-y-5'>
                <div className='flex items-center justify-between'>
                  <p className='text-muted-foreground'>Subtotal</p>
                  <p className='font-medium'>${selectedCollectionPrice}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-muted-foreground'>VAT (20%)</p>
                  <p className='font-medium'>${vatValue}</p>
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <p className='text-lg font-semibold'>Total</p>
                  <p className='text-lg font-semibold'>${totalPrice}</p>
                </div>
              </div>
              {/* Submit Button */}
              <Button type='submit' size='lg' className='mt-9 w-full rounded-lg'>
                Pay ${totalPrice}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShoppingCart
