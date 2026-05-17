'use client';
import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown, Camera } from 'lucide-react';

export interface HeaderProps {
  logoUrl?: string; // URL for store logo
  storeName: string; // Store name
  navItems: { label: string; url: string }[]; // Top navigation links
  cartCount: number; // Number of items in cart
  onSearch: (q: string) => void; 
  onSignIn: () => void;
  homeUrl: string; // URL for homepage
  cartUrl: string; // URL for cart page
  accountUrl: string; // URL for user account
}

export function Header({ logoUrl, storeName, navItems, cartCount, onSearch, onSignIn, homeUrl, cartUrl, accountUrl }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--shop-card)] border-b border-[var(--shop-border)]">
      {/* Top Bar (Desktop) */}
      <div className="hidden lg:block bg-[var(--shop-bg)] border-b border-[var(--shop-border)] py-1">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center text-xs text-[var(--shop-ink-muted)]">
          <div className="flex gap-4">
            <span className="hover:text-[var(--shop-primary)] cursor-pointer">สวัสดี! กรุณาเข้าสู่ระบบ</span>
            <span className="hover:text-[var(--shop-primary)] cursor-pointer" onClick={onSignIn}>สมัครสมาชิกฟรี</span>
          </div>
          <div className="flex gap-4">
            {navItems.map((item, idx) => (
              <a key={idx} href={item.url} className="hover:text-[var(--shop-primary)]">{item.label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1400px] mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center gap-4 lg:gap-8">
          
          {/* Mobile Menu */}
          <button className="lg:hidden p-1 text-[var(--shop-ink)]">
            <Menu size={24} />
          </button>

          {/* Logo */}
          <a href={homeUrl} className="flex-shrink-0 flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 lg:h-12 w-auto object-contain" />
            ) : (
              <div className="text-2xl lg:text-3xl font-extrabold text-[var(--shop-primary)] tracking-tight">
                {storeName}
              </div>
            )}
          </a>

          {/* Search Bar (Expandable in Taobao style) */}
          <div className="flex-1 max-w-3xl mx-auto hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <div className="relative flex-1 flex items-center border-2 border-[var(--shop-primary)] rounded-l-full bg-white px-4 py-2 lg:py-2.5">
                <input 
                  type="text" 
                  placeholder="ค้นหาสินค้า แบรนด์ หรือร้านค้า..." 
                  className="w-full bg-transparent outline-none text-[var(--shop-ink)] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" className="text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] absolute right-4">
                  <Camera size={18} />
                </button>
              </div>
              <button 
                type="submit" 
                className="bg-[var(--mega-gradient-btn)] text-white px-6 lg:px-8 font-bold text-sm lg:text-base rounded-r-full hover:opacity-90"
              >
                ค้นหา
              </button>
            </form>
            <div className="flex gap-3 text-xs text-[var(--shop-ink-muted)] mt-1.5 px-4">
              <span className="hover:text-[var(--shop-primary)] cursor-pointer text-[var(--shop-primary)]">ดีลเด็ดวันนี้</span>
              <span className="hover:text-[var(--shop-primary)] cursor-pointer">สมาร์ทโฟน</span>
              <span className="hover:text-[var(--shop-primary)] cursor-pointer">แฟชั่นผู้หญิง</span>
              <span className="hover:text-[var(--shop-primary)] cursor-pointer">ของใช้ในบ้าน</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0 ml-auto sm:ml-0">
            <button className="sm:hidden p-2 text-[var(--shop-ink)]" onClick={() => onSearch('')}>
              <Search size={22} />
            </button>
            
            <a 
              href={accountUrl} 
              className="hidden lg:flex flex-col items-center justify-center text-[var(--shop-ink)] hover:text-[var(--shop-primary)] cursor-pointer"
            >
              <User size={22} />
              <span className="text-[10px] mt-0.5">บัญชีของฉัน</span>
            </a>
            
            <a 
              href={cartUrl} 
              className="relative flex flex-col items-center justify-center text-[var(--shop-ink)] hover:text-[var(--shop-primary)]"
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[var(--shop-primary)] text-white text-[10px] items-center justify-center flex h-4 min-w-[16px] px-1 rounded-full border-2 border-[var(--shop-card)] font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 hidden lg:inline-block">ตะกร้าสินค้า</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
