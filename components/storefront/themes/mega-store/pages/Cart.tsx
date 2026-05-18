'use client';
import React from 'react';
import { ShoppingCart, Trash2, ShieldCheck, Ticket, Store, ChevronRight } from 'lucide-react';

interface CartItemInfo {
  id: string; // Item ID
  productId: string; // Product ID
  name: string; // Product Name
  price: number; // Unit price
  qty: number; // Quantity in cart
  image?: string; // Product Image
  storeName: string; // Vendor name
}

export interface CartProps {
  items: CartItemInfo[]; // list of items
  selectedItemIds: string[]; // which items are checked
  onToggleSelectItem: (id: string, selected: boolean) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onUpdateQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  shopUrl: string; // url to continue shopping
  checkoutUrl: string; // url to proceed
}

export function Cart({ items, selectedItemIds, onToggleSelectItem, onToggleSelectAll, onUpdateQty, onRemove, shopUrl, checkoutUrl }: CartProps) {
  
  const selectedItems = items.filter(i => selectedItemIds.includes(i.id));
  const subtotal = selectedItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const totalQty = selectedItems.reduce((acc, i) => acc + i.qty, 0);
  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;

  if (!items || items.length === 0) {
    return (
      <div className="bg-[var(--shop-bg)] min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
         <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
           <ShoppingCart size={40} className="text-gray-300" />
         </div>
         <h2 className="text-lg font-bold text-[var(--shop-ink)] mb-2">รถเข็นของคุณยังว่างเปล่า</h2>
         <p className="text-[var(--shop-ink-muted)] mb-6 text-sm">มองหาไอเดียใหม่ๆ อยู่รึเปล่า?</p>
         <a href={shopUrl} className="bg-[var(--shop-primary)] text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:scale-105 transition-transform">ไปช้อปเลย</a>
      </div>
    );
  }

  // Group items by store for classic Mega Store view
  const storeGroups = items.reduce((acc: Record<string, CartItemInfo[]>, item) => {
    if (!acc[item.storeName]) acc[item.storeName] = [];
    acc[item.storeName].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen pb-[100px] md:pb-8 pt-4 md:pt-8">
      <div className="max-w-[1200px] mx-auto px-0 md:px-4 flex flex-col lg:flex-row gap-4">
        
        {/* Left Column - Item List */}
        <div className="flex-1 space-y-4">
          
          {/* Desktop Header */}
          <div className="hidden md:flex bg-white py-3 px-4 rounded-lg border border-[var(--shop-border)] items-center text-sm text-[var(--shop-ink-muted)]">
             <div className="flex items-center gap-3 w-1/2">
                <input type="checkbox" checked={isAllSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} className="w-4 h-4 accent-[var(--shop-primary)]" />
                <span>สินค้าทั้งหมด</span>
             </div>
             <div className="w-1/6 text-center">ราคาต่อชิ้น</div>
             <div className="w-1/6 text-center">จำนวน</div>
             <div className="w-1/6 text-right">ราคารวม</div>
          </div>

          {/* Stores and items */}
          {Object.entries(storeGroups).map(([storeName, groupItems], sIdx) => (
            <div key={sIdx} className="bg-white md:rounded-lg border-y md:border border-[var(--shop-border)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--shop-border)]">
                 <input 
                   type="checkbox" 
                   checked={groupItems.every(i => selectedItemIds.includes(i.id))} 
                   onChange={(e) => {
                     groupItems.forEach(i => onToggleSelectItem(i.id, e.target.checked));
                   }} 
                   className="w-4 h-4 accent-[var(--shop-primary)]" 
                 />
                 <Store size={16} className="text-[var(--shop-ink)]" />
                 <span className="font-bold text-[var(--shop-ink)] text-sm">{storeName}</span>
                 <ChevronRight size={14} className="text-[var(--shop-ink-muted)]" />
              </div>
              
              <div className="divide-y divide-[var(--shop-border)]">
                {groupItems.map(item => {
                  const isChecked = selectedItemIds.includes(item.id);
                  return (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      {/* Flex row mobile */}
                      <div className="flex items-start gap-3 w-full md:w-1/2">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={(e) => onToggleSelectItem(item.id, e.target.checked)}
                          className="w-4 h-4 accent-[var(--shop-primary)] mt-3 md:mt-0" 
                        />
                        <div className="w-20 h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                           {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-[var(--shop-ink)] line-clamp-2 md:line-clamp-1">{item.name}</span>
                          <span className="text-xs text-[var(--shop-ink-muted)] mt-1 bg-gray-50 px-2 py-0.5 rounded w-max">ตัวเลือกสินค้า... <ChevronRight size={10} className="inline"/></span>
                          
                          {/* Mobile Price & Qty */}
                          <div className="flex items-end justify-between mt-2 md:hidden w-full">
                            <span className="font-bold text-[var(--shop-primary)]">฿{item.price.toLocaleString()}</span>
                            <div className="flex items-center border border-[var(--shop-border)] rounded h-7">
                               <button onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))} className="px-2 text-gray-500">-</button>
                               <input type="number" value={item.qty} readOnly className="w-8 text-center text-xs font-semibold border-x border-[var(--shop-border)] outline-none" />
                               <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="px-2 text-gray-500">+</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden md:block w-1/6 text-center text-sm font-semibold text-[var(--shop-ink)]">
                        ฿{item.price.toLocaleString()}
                      </div>
                      
                      {/* Desktop Qty */}
                      <div className="hidden md:flex w-1/6 justify-center">
                        <div className="flex items-center border border-[var(--shop-border)] rounded h-8">
                           <button onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))} className="px-2.5 text-gray-500 hover:bg-gray-50">-</button>
                           <input type="number" value={item.qty} readOnly className="w-10 text-center text-xs font-semibold border-x border-[var(--shop-border)] outline-none h-full" />
                           <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="px-2.5 text-gray-500 hover:bg-gray-50">+</button>
                        </div>
                      </div>

                      {/* Desktop Total Price */}
                      <div className="hidden md:flex w-1/6 justify-end items-center gap-4">
                        <span className="font-bold text-[var(--shop-primary)]">฿{(item.price * item.qty).toLocaleString()}</span>
                        <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-[var(--shop-primary)] transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Sticky Summary */}
        <div className="hidden lg:block w-[320px] flex-shrink-0">
           <div className="bg-white rounded-lg border border-[var(--shop-border)] p-4 sticky top-24">
              <h3 className="font-bold text-[var(--shop-ink)] mb-4">สรุปคำสั่งซื้อ</h3>
              
              <div className="space-y-3 text-sm border-b border-[var(--shop-border)] pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-[var(--shop-ink-muted)]">ราคาชิ้นค้าทั้งหมด ({totalQty} ชิ้น)</span>
                  <span className="text-[var(--shop-ink)]">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--shop-primary)] font-medium">
                  <span>ส่วนลด</span>
                  <span>฿0</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-[var(--shop-ink)]">ยอดสุทธิ</span>
                <span className="text-2xl font-extrabold text-[var(--shop-primary)]">฿{subtotal.toLocaleString()}</span>
              </div>

              <a href={checkoutUrl} className={`block text-center w-full py-3 rounded-lg font-bold text-white transition-opacity ${totalQty > 0 ? 'bg-[var(--mega-gradient-btn)] hover:opacity-90 shadow-md' : 'bg-gray-300 pointer-events-none'}`}>
                ชำระเงิน ({totalQty})
              </a>
           </div>
        </div>

      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--shop-border)] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="flex items-center justify-between px-4 h-16">
           <label className="flex items-center gap-2 cursor-pointer">
             <input type="checkbox" checked={isAllSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} className="w-5 h-5 accent-[var(--shop-primary)]" />
             <span className="text-sm font-medium text-[var(--shop-ink)]">ทั้งหมด</span>
           </label>

           <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs text-[var(--shop-ink)]">รวมทั้งหมด</span>
                <span className="text-lg font-extrabold text-[var(--shop-primary)] leading-none">฿{subtotal.toLocaleString()}</span>
              </div>
              <a href={checkoutUrl} className={`h-10 px-6 flex items-center justify-center rounded-full font-bold text-white ${totalQty > 0 ? 'bg-[var(--mega-gradient-btn)] shadow-md' : 'bg-gray-300 pointer-events-none'}`}>
                ชำระเงิน ({totalQty})
              </a>
           </div>
        </div>
      </div>

    </div>
  );
}
