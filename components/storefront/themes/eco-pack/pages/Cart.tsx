'use client';
import React from 'react';
import { Package, Trash2, ArrowRight } from 'lucide-react';

interface CartItem {
  id: string; // Cart item ID
  productId: string; // Original product ID
  name: string; // Product name
  price: number; // Unit price
  qty: number; // Quantity in cart
  image?: string; // Item thumbnail
  size?: string; // Selected size
  color?: string; // Selected color
}

export interface CartProps {
  items: CartItem[]; // Items in the cart
  freeShippingThreshold?: number; // Target for free shipping
  currentSubtotal: number; // Cart subtotal
  onUpdateQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  onApplyPromo: (code: string) => void;
  shopUrl: string; // URL for continuing shopping
  checkoutUrl: string; // URL for checkout
}

export function Cart({ items, freeShippingThreshold = 5000, currentSubtotal, onUpdateQty, onRemove, onApplyPromo, shopUrl, checkoutUrl }: CartProps) {
  
  const shipRemain = freeShippingThreshold - currentSubtotal;
  const progress = Math.min(100, Math.max(0, (currentSubtotal / freeShippingThreshold) * 100));

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[var(--shop-bg)]">
         <Package size={64} className="text-[var(--shop-border)] mb-4" />
         <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-2">Your Cart is Empty</h2>
         <p className="text-[var(--shop-ink-muted)] mb-6">Looks like you haven't added any packaging yet.</p>
         <a href={shopUrl} className="bg-[var(--shop-primary)] text-white px-8 py-3 rounded-md font-semibold">Start Shopping</a>
      </div>
    );
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--shop-ink)] mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1">
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl overflow-hidden">
              <ul className="divide-y divide-[var(--shop-border)]">
                {items.map((item, i) => (
                  <li key={item.id || i} className="p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-24 h-24 bg-[var(--shop-bg)] rounded-lg flex-shrink-0 flex items-center justify-center border border-[var(--shop-border)] relative overflow-hidden">
                      {item.image ? <img src={item.image} className="object-cover w-full h-full" /> : <Package className="text-gray-300" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-[var(--shop-ink)]">{item.name}</h3>
                          <p className="text-sm text-[var(--shop-ink-muted)] mt-1">Size: {item.size} | Color: {item.color}</p>
                        </div>
                        <div className="font-semibold text-[var(--shop-ink)] text-right">
                          ฿{(item.price * item.qty).toFixed(2)}
                          <div className="text-xs text-[var(--shop-ink-muted)] font-normal mt-1">฿{item.price}/ea</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-[var(--shop-border)] rounded-md">
                           <button onClick={() => onUpdateQty(item.id, Math.max(50, item.qty - 50))} className="px-3 py-1 text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)]">-</button>
                           <input type="number" readOnly value={item.qty} className="w-12 text-center text-sm font-medium bg-transparent outline-none" />
                           <button onClick={() => onUpdateQty(item.id, item.qty + 50)} className="px-3 py-1 text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)]">+</button>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-[400px]">
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[var(--shop-ink)] mb-6">Order Summary</h2>
              
              {/* Shipping Progress */}
              <div className="mb-6 pb-6 border-b border-[var(--shop-border)]">
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-medium text-[var(--shop-ink)]">Free Bulk Shipping</span>
                   <span className="text-[var(--shop-ink-muted)]">
                     {shipRemain > 0 ? `Add ฿${shipRemain.toFixed(2)}` : 'Unlocked!'}
                   </span>
                 </div>
                 <div className="h-2 bg-[var(--shop-bg)] rounded-full overflow-hidden">
                   <div className="h-full bg-[var(--shop-accent)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                 </div>
              </div>

              <div className="space-y-4 text-sm text-[var(--shop-ink)] border-b border-[var(--shop-border)] pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">฿{currentSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-semibold">฿{(currentSubtotal * 0.07).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--shop-ink-muted)]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-[var(--shop-ink)] text-lg">Total</span>
                <span className="font-bold text-2xl text-[var(--shop-primary)]">฿{(currentSubtotal * 1.07).toFixed(2)}</span>
              </div>

              <a href={checkoutUrl} className="w-full bg-[var(--shop-primary)] text-white h-14 rounded-md font-semibold hover:opacity-90 flex justify-center items-center gap-2 text-lg">
                Proceed to Checkout <ArrowRight size={20} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
