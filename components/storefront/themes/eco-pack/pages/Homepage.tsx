'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Truck, Package } from 'lucide-react';

interface StoreInfo {
  name: string; // From Prisma - store name
}

interface ProductInfo {
  slug: string; // Product slug for URL
  name: string; // Product name
  image?: string; // Product main image
  price?: number; // Product price
  dimensions?: string; // Product dimensions e.g. "17 x 25 x 9 cm"
  badge?: string; // Highlight badge e.g. "Best Seller"
}

interface CategoryInfo {
  id: string; // Category ID
  name: string; // Category name
  slug: string; // Category slug
  image?: string; // Category image
}

export interface HomepageProps {
  store: StoreInfo; // Store details
  featuredProducts: ProductInfo[]; // Featured products list
  categories: CategoryInfo[]; // Categories list
  reviews: { id: string; user: string; comment: string; rating: number }[]; // Customer reviews
  shopUrl: string; // URL for shop catalog
  cartUrl: string; // URL for cart
}

export function Homepage({ store, featuredProducts, categories, reviews, shopUrl, cartUrl }: HomepageProps) {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[var(--eco-kraft)] text-white overflow-hidden isolate">
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              Sustainably Crafted <br /> Packaging
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 font-medium">
              Elevate your brand with premium kraft boxes, mailers, and eco-friendly tape. Zero plastic. 100% recyclable.
            </p>
            <div className="flex gap-4">
              <a href={shopUrl} className="bg-white text-[var(--shop-primary)] px-8 py-3 rounded-md font-semibold hover:bg-gray-50 flex items-center gap-2">
                Shop Catalog <ArrowRight size={18} />
              </a>
              <a href={cartUrl} className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10">
                Bulk Orders
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-b border-[var(--shop-border)] bg-[var(--shop-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--shop-border)]">
            <div className="flex flex-col items-center justify-center p-4">
              <Leaf size={32} className="text-[var(--shop-accent)] mb-3" />
              <h3 className="font-semibold text-[var(--shop-ink)]">100% Eco-Friendly</h3>
              <p className="text-sm text-[var(--shop-ink-muted)] mt-1">Biodegradable and recyclable materials.</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <ShieldCheck size={32} className="text-[var(--shop-primary)] mb-3" />
              <h3 className="font-semibold text-[var(--shop-ink)]">Premium Durability</h3>
              <p className="text-sm text-[var(--shop-ink-muted)] mt-1">Thick corrugated cardboard for safe transit.</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <Truck size={32} className="text-[var(--shop-ink-muted)] mb-3" />
              <h3 className="font-semibold text-[var(--shop-ink)]">Fast Shipping</h3>
              <p className="text-sm text-[var(--shop-ink-muted)] mt-1">Same-day dispatch for orders before 2PM.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-[var(--shop-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <a key={i} href={`${shopUrl}?category=${cat.id}`} className="group block h-64 relative rounded-xl overflow-hidden bg-[var(--shop-border)]">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--eco-kraft)] to-[var(--shop-primary)] opacity-80" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-[var(--shop-ink)]">{cat.name}</span>
                  <ArrowRight size={18} className="text-[var(--shop-primary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-[var(--shop-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-[var(--shop-ink)]">Best Selling Sizes</h2>
            <a href={shopUrl} className="text-sm font-medium text-[var(--shop-primary)] hover:underline">View all</a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {featuredProducts.map((p, i) => (
              <a key={i} href={`${shopUrl}/${p.slug}`} className="group flex flex-col">
                <div className="aspect-square w-full rounded-lg bg-[var(--shop-bg)] overflow-hidden border border-[var(--shop-border)] mb-4 relative">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--shop-ink-muted)]">
                      <Package size={48} className="opacity-20" />
                    </div>
                  )}
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-[var(--shop-accent)] text-white text-xs font-bold px-2 py-1 rounded">
                      {p.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-[var(--shop-ink)] mb-1 flex-1">{p.name}</h3>
                <p className="text-sm text-[var(--shop-ink-muted)] mb-2">{p.dimensions || 'Various sizes'}</p>
                <div className="font-semibold text-[var(--shop-ink)]">
                  {p.price ? `$${p.price.toFixed(2)}` : 'From $0.50/ea'}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
