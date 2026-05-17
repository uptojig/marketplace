'use client';
import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface CheckoutAddress {
  firstName: string; // First name
  lastName: string; // Last name
  company: string; // Company name
  address: string; // Full address
  city: string; // City
  postalCode: string; // Postal code
}

interface ShippingOption {
  label: string; // Delivery speed
  time: string; // Delivery time description
  price: number; // Delivery price
}

interface PaymentMethod {
  id: string; // Method ID
  name: string; // Method name
}

interface OrderItem {
  name: string; // Product name
  qty: number; // Quantity
  price: number; // Item price
}

export type CheckoutStepData = Record<string, string | number | boolean | undefined>;

export interface CheckoutProps {
  items: OrderItem[]; // Order items
  address?: CheckoutAddress; // Optional saved address
  shippingOptions: ShippingOption[]; // Available delivery options
  paymentMethods: PaymentMethod[]; // Available payment channels
  currentStep: number; // Current active step (1-3)
  onSubmitStep: (step: number, data: CheckoutStepData) => void;
  shopUrl: string; // URL for continuing shopping
}

export function Checkout({ items, address, shippingOptions, paymentMethods, currentStep, onSubmitStep, shopUrl }: CheckoutProps) {
  
  const steps = [
    { num: 1, label: 'Shipping Address' },
    { num: 2, label: 'Delivery Method' },
    { num: 3, label: 'Payment' }
  ];

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--shop-ink)] mb-6 text-center">Checkout</h1>
          <div className="flex justify-center items-center">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className={`flex items-center gap-2 ${currentStep >= s.num ? 'text-[var(--shop-primary)]' : 'text-[var(--shop-ink-muted)]'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= s.num ? 'bg-[var(--shop-primary)] text-white' : 'bg-[var(--shop-border)] text-[var(--shop-ink-muted)]'}`}>
                    {currentStep > s.num ? <CheckCircle2 size={16} /> : s.num}
                  </div>
                  <span className="hidden sm:inline font-medium text-sm">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-[2px] mx-2 sm:mx-4 ${currentStep > s.num ? 'bg-[var(--shop-primary)]' : 'bg-[var(--shop-border)]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl shadow-sm p-6 md:p-10">
          
          {currentStep === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); onSubmitStep(1, {}); }}>
              <h2 className="text-xl font-bold text-[var(--shop-ink)] mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <input type="text" placeholder="First Name" className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
                <input type="text" placeholder="Last Name" className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
                <input type="text" placeholder="Company (Optional)" className="sm:col-span-2 w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" />
                <input type="text" placeholder="Address Address" className="sm:col-span-2 w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
                <input type="text" placeholder="City" className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
                <input type="text" placeholder="Postal Code" className="w-full border border-[var(--shop-border)] rounded-md px-4 py-3 text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)]" required />
              </div>
              <button type="submit" className="w-full bg-[var(--shop-primary)] text-white py-4 rounded-md font-bold hover:opacity-90 transition-opacity">
                Continue to Delivery
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); onSubmitStep(2, {}); }}>
              <h2 className="text-xl font-bold text-[var(--shop-ink)] mb-6">Delivery Method</h2>
              <div className="space-y-4 mb-8">
                {shippingOptions.map((opt, i) => (
                  <label key={i} className="flex items-center justify-between border border-[var(--shop-border)] rounded-lg p-5 cursor-pointer hover:border-[var(--shop-primary)] transition-colors">
                    <div className="flex items-center gap-4">
                      <input type="radio" name="shipping" defaultChecked={i === 0} className="text-[var(--shop-primary)] focus:ring-[var(--shop-primary)] h-5 w-5" />
                      <div>
                        <div className="font-semibold text-[var(--shop-ink)]">{opt.label}</div>
                        <div className="text-sm text-[var(--shop-ink-muted)]">{opt.time}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-[var(--shop-ink)]">{opt.price === 0 ? 'Free' : `฿${opt.price}`}</div>
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full bg-[var(--shop-primary)] text-white py-4 rounded-md font-bold hover:opacity-90 transition-opacity">
                Continue to Payment
              </button>
            </form>
          )}

          {currentStep === 3 && (
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={40} />
               </div>
               <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-2">Order Confirmed!</h2>
               <p className="text-[var(--shop-ink-muted)] mb-8">Thank you for your eco-friendly choice. We've sent a confirmation email to you.</p>
               <a href={shopUrl} className="text-[var(--shop-primary)] font-medium hover:underline">Continue Shopping</a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
