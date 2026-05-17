'use client';
import React, { useState } from 'react';
import { Package, Truck, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react';

interface ProductDetailInfo {
  id: string; // Product ID
  name: string; // Product name
  price: number; // Product price
  images: string[]; // Product image URLs
}

export interface ProductDetailProps {
  product: ProductDetailInfo; // Current product
  relatedProducts: ProductDetailInfo[]; // Related products
  reviews: { user: string; text: string; rating: number }[]; // Product reviews
  onAddToCart: () => void;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: string) => void;
  qty: number; // Selected quantity
  onChangeQty: (q: number) => void;
  homeUrl: string; // URL for homepage
  shopUrl: string; // URL for shop
}

export function ProductDetail({ product, relatedProducts, reviews, onAddToCart, onSelectColor, onSelectSize, qty, onChangeQty, homeUrl, shopUrl }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);

  // Mock safety values
  const images = product.images || [null, null, null];
  
  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center text-sm text-[var(--shop-ink-muted)]">
        <a href={homeUrl} className="hover:text-[var(--shop-ink)]">Home</a>
        <ChevronRight size={14} className="mx-2" />
        <a href={shopUrl} className="hover:text-[var(--shop-ink)]">Catalog</a>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-[var(--shop-ink)] truncate">{product.name || 'Product'}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 flex-shrink-0">
              {images.map((img: string | null, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square w-20 md:w-full rounded-lg border-2 ${activeImage === idx ? 'border-[var(--shop-primary)]' : 'border-transparent'} bg-gray-100 overflow-hidden relative flex-shrink-0`}
                >
                  {img ? <img src={img} className="w-full h-full object-cover" /> : <Package className="absolute inset-0 m-auto text-gray-300" />}
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-[4/3] md:aspect-square bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-2xl overflow-hidden relative">
               {images[activeImage] ? (
                 <img src={images[activeImage]} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-[var(--shop-border)]">
                   <Package size={100} />
                 </div>
               )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--shop-ink)] tracking-tight mb-2">
              {product.name || 'Standard Mailer Box C'}
            </h1>
            <p className="text-[var(--shop-ink-muted)] mb-6 text-sm">SKU: MB-C-KRAFT-001</p>

            <div className="text-2xl font-semibold text-[var(--shop-primary)] mb-6">
              ฿{(product.price || 15).toFixed(2)} <span className="text-sm font-normal text-[var(--shop-ink-muted)]">/ box (min 50)</span>
            </div>

            {/* Colors / Material */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[var(--shop-ink)] mb-3">Material</h3>
              <div className="flex gap-3">
                {['Kraft Brown', 'Recycled White'].map((c, i) => (
                  <button 
                    key={i}
                    onClick={() => onSelectColor(c)}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--shop-border)] bg-[var(--shop-card)] text-[var(--shop-ink)] hover:border-[var(--shop-primary)] focus:ring-2 focus:ring-[var(--shop-primary)] outline-none"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-sm font-medium text-[var(--shop-ink)]">Dimensions (W x L x H)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['11 x 17 x 6 cm (A)','14 x 20 x 6 cm (B)','17 x 25 x 9 cm (C)'].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => onSelectSize(s)}
                    className={`px-4 py-3 text-left text-sm font-medium rounded-md border ${i===2 ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)] text-white' : 'border-[var(--shop-border)] bg-[var(--shop-card)] text-[var(--shop-ink)] hover:border-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Area */}
            <div className="flex gap-4 mb-10 pt-6 border-t border-[var(--shop-border)]">
              <div className="flex items-center border border-[var(--shop-border)] bg-[var(--shop-card)] rounded-md h-12 px-2">
                <button onClick={() => onChangeQty(Math.max(50, qty - 50))} className="p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)]">
                  <Minus size={18} />
                </button>
                <input 
                  type="number" 
                  value={qty} 
                  readOnly 
                  className="w-12 text-center text-[var(--shop-ink)] font-medium outline-none bg-transparent" 
                />
                <button onClick={() => onChangeQty(qty + 50)} className="p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)]">
                  <Plus size={18} />
                </button>
              </div>
              <button 
                onClick={onAddToCart}
                className="flex-1 bg-[var(--shop-primary)] text-white h-12 rounded-md font-semibold hover:opacity-90 flex justify-center items-center gap-2"
              >
                Add {qty} to Cart
              </button>
            </div>

            {/* Selling points */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-[var(--shop-ink)] px-4 py-3 bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-md">
                <ShieldCheck size={20} className="text-[var(--shop-accent)]" />
                <span>Heavy-duty 3-layer corrugated board (E-Flute)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--shop-ink)] px-4 py-3 bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-md">
                <Truck size={20} className="text-[var(--shop-primary)]" />
                <span>Ships flat. Estimated delivery in 2-3 days.</span>
              </div>
            </div>

          </div>
        </div>

        {/* Volume Discount Table */}
        <div className="mt-20">
          <h2 className="text-xl font-bold text-[var(--shop-ink)] mb-6">Volume Discounts</h2>
          <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-card)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--shop-bg)] border-b border-[var(--shop-border)] text-[var(--shop-ink-muted)] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  <th className="px-6 py-4 font-medium">Price per unit</th>
                  <th className="px-6 py-4 font-medium text-right">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--shop-border)] text-[var(--shop-ink)]">
                <tr><td className="px-6 py-4 font-medium">50 - 499</td><td className="px-6 py-4">฿15.00</td><td className="px-6 py-4 text-right">-</td></tr>
                <tr className="bg-[var(--shop-bg)]"><td className="px-6 py-4 font-medium">500 - 1,999</td><td className="px-6 py-4">฿13.50</td><td className="px-6 py-4 text-right text-[var(--shop-accent)] font-medium">10% Off</td></tr>
                <tr><td className="px-6 py-4 font-medium">2,000+</td><td className="px-6 py-4">฿11.00</td><td className="px-6 py-4 text-right text-[var(--shop-accent)] font-medium">26% Off</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
