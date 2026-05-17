'use client';
import React, { useState } from 'react';
import { MapPin, Ticket, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

interface CheckoutAddress {
  id: string; // Address ID
  name: string; // Recipient name
  phone: string; // Phone string
  address: string; // Detail address
  isDefault?: boolean; // Is default address
}

interface OrderItem {
  id: string; // Item ID
  name: string; // Prod name
  price: number; // Unit price
  qty: number; // Qty
  image?: string; // Opt thumbnail
  storeName: string; // Vendor name
}

interface PaymentMethod {
  id: string; // method id
  name: string; // method name e.g. Credit Card, PromptPay, COD
  icon?: string; // String for icon 
}

export interface CheckoutProps {
  items: OrderItem[];
  addresses: CheckoutAddress[];
  paymentMethods: PaymentMethod[];
  shippingFee: number; // Delivery cost
  onSubmitOrder: (addressId: string, paymentMethodId: string) => void;
  shopUrl: string; // fallback if empty
}

export function Checkout({ items, addresses, paymentMethods, shippingFee, onSubmitOrder, shopUrl }: CheckoutProps) {
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id || '');

  const defaultAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const itemsSubtotal = items.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const total = itemsSubtotal + shippingFee;

  // Group items by store for checkout view
  const storeGroups = items.reduce((acc: Record<string, OrderItem[]>, item) => {
    if (!acc[item.storeName]) acc[item.storeName] = [];
    acc[item.storeName].push(item);
    return acc;
  }, {});

  if (!items || items.length === 0) {
    return (
      <div className="bg-[var(--shop-bg)] min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p>ไม่พบสินค้าสำหรับการชำระเงิน</p>
        <a href={shopUrl} className="mt-4 bg-[var(--shop-primary)] px-6 py-2 rounded-full text-white">กลับไปช้อปปิ้ง</a>
      </div>
    );
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen pb-[120px] md:pb-8 pt-4 md:pt-8">
      <div className="max-w-[1200px] mx-auto px-0 md:px-4 flex flex-col lg:flex-row gap-4">
        
        <div className="flex-1 space-y-4">
           {/* Address Block */}
           <div className="bg-white md:rounded-lg border-y md:border border-[var(--shop-border)] overflow-hidden">
             {/* Decorative Mail Edge Taobao Style */}
             <div className="h-1 w-full" style={{ background: 'repeating-linear-gradient(45deg, #FF0036, #FF0036 10px, transparent 10px, transparent 20px, #3b82f6 20px, #3b82f6 30px, transparent 30px, transparent 40px)' }}></div>
             
             <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 text-[var(--shop-primary)] font-bold mb-4">
                  <MapPin size={20} /> <h2 className="text-lg">ที่อยู่สำหรับการจัดส่ง</h2>
                </div>
                
                {defaultAddress ? (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[var(--shop-ink)] text-sm sm:text-base flex items-center gap-2">
                        {defaultAddress.name} ({defaultAddress.phone})
                        {defaultAddress.isDefault && <span className="bg-gray-100 text-[10px] text-gray-500 px-1.5 py-0.5 rounded border">ค่าเริ่มต้น</span>}
                      </div>
                      <div className="text-[var(--shop-ink-muted)] text-sm mt-1">{defaultAddress.address}</div>
                    </div>
                    <button className="text-[var(--shop-primary)] text-sm whitespace-nowrap ml-4">เปลี่ยน</button>
                  </div>
                ) : (
                  <button className="text-[var(--shop-primary)] border border-[var(--shop-primary)] px-4 py-2 rounded">เพิ่มที่อยู่ใหม่</button>
                )}
             </div>
           </div>

           {/* Products Block */}
           <div className="bg-white md:rounded-lg border-y md:border border-[var(--shop-border)] p-4 sm:p-6">
             <h2 className="font-bold text-[var(--shop-ink)] mb-4 text-lg">ตรวจสอบรายการสินค้า</h2>
             
             <div className="space-y-6">
               {Object.entries(storeGroups).map(([storeName, groupItems], sIdx) => (
                 <div key={sIdx}>
                   <div className="font-bold text-[var(--shop-ink)] text-sm border-b border-[var(--shop-border)] pb-2 mb-4">{storeName}</div>
                   <div className="space-y-4">
                     {groupItems.map(item => (
                       <div key={item.id} className="flex gap-4">
                         <div className="w-16 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                           {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                         </div>
                         <div className="flex-1 flex flex-col justify-center">
                           <span className="text-sm text-[var(--shop-ink)] line-clamp-1">{item.name}</span>
                           <div className="flex justify-between items-center mt-2">
                             <span className="font-bold text-[var(--shop-ink)] text-sm">฿{item.price.toLocaleString()}</span>
                             <span className="text-[var(--shop-ink-muted)] text-sm">x{item.qty}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   {/* Store subtotal & shipping mode */}
                   <div className="mt-4 bg-orange-50/50 p-3 rounded border border-orange-100 flex justify-between items-center text-sm">
                     <span className="text-[var(--shop-ink)]">การจัดส่ง: <span className="font-semibold text-green-600">Standard Delivery</span></span>
                     <span className="font-bold text-[var(--shop-ink)]">฿{shippingFee.toLocaleString()}</span>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Payment Methods */}
           <div className="bg-white md:rounded-lg border-y md:border border-[var(--shop-border)] p-4 sm:p-6">
             <div className="flex items-center gap-2 font-bold text-[var(--shop-ink)] mb-4">
                <CreditCard size={20} className="text-[var(--shop-primary)]" /> <h2 className="text-lg">วิธีการชำระเงิน</h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {paymentMethods.map(pm => (
                 <button 
                   key={pm.id} 
                   onClick={() => setSelectedPaymentId(pm.id)}
                   className={`border py-3 px-2 rounded-md text-sm font-medium transition-all ${selectedPaymentId === pm.id ? 'border-[var(--shop-primary)] border-2 text-[var(--shop-primary)] bg-orange-50 relative' : 'border-[var(--shop-border)] text-[var(--shop-ink)] hover:border-[var(--shop-primary)]'}`}
                 >
                   {pm.name}
                   {selectedPaymentId === pm.id && (
                     <div className="absolute right-0 bottom-0 w-0 h-0 border-b-[16px] border-l-[16px] border-b-[var(--shop-primary)] border-l-transparent">
                       <CheckIcon className="absolute right-[-14px] bottom-[-14px] text-white w-[10px] h-[10px]" />
                     </div>
                   )}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Desktop Sticky Summary */}
        <div className="hidden lg:block w-[340px] flex-shrink-0">
           <div className="bg-white rounded-lg border border-[var(--shop-border)] p-5 sticky top-24">
              <h3 className="font-bold text-lg text-[var(--shop-ink)] mb-4 flex items-center gap-2"><Ticket size={18} className="text-[var(--shop-primary)]"/> ส่วนลดและคูปอง</h3>
              <button className="w-full flex justify-between items-center border border-[var(--shop-border)] p-3 rounded mb-6 hover:bg-gray-50">
                <span className="text-sm text-[var(--shop-ink-muted)]">เลือกคูปองส่วนลด</span>
                <ChevronRight size={16} className="text-[var(--shop-ink-muted)]"/>
              </button>

              <h3 className="font-bold text-lg text-[var(--shop-ink)] mb-4">สรุปคำสั่งซื้อ</h3>
              
              <div className="space-y-3 text-sm border-b border-[var(--shop-border)] pb-4 mb-4 text-[var(--shop-ink-muted)]">
                <div className="flex justify-between">
                  <span>รวมค่าสินค้า</span>
                  <span>฿{itemsSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>รวมค่าจัดส่ง</span>
                  <span>฿{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--shop-primary)]">
                  <span>ส่วนลดรวม</span>
                  <span>- ฿0</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-[var(--shop-ink)]">ยอดชำระเงินทั้งหมด</span>
                <span className="text-2xl font-extrabold text-[var(--shop-primary)] leading-none">฿{total.toLocaleString()}</span>
              </div>

              <button 
                onClick={() => onSubmitOrder(selectedAddressId, selectedPaymentId)}
                className="w-full bg-[var(--mega-gradient-btn)] text-white py-3.5 rounded-lg font-bold shadow-[0_4px_12px_rgba(255,80,0,0.3)] hover:opacity-90 flex items-center justify-center gap-2"
              >
                สั่งสินค้า <ShieldCheck size={18}/>
              </button>
           </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--shop-border)] z-40">
        <div className="flex items-center justify-between px-4 h-16">
           <div className="flex flex-col items-end flex-1 pr-4">
              <span className="text-xs text-[var(--shop-ink-muted)]">ยอดชำระเงินทั้งหมด</span>
              <span className="text-xl font-extrabold text-[var(--shop-primary)] leading-none">฿{total.toLocaleString()}</span>
           </div>
           <button 
             onClick={() => onSubmitOrder(selectedAddressId, selectedPaymentId)}
             className="h-10 px-8 flex items-center justify-center rounded-full font-bold text-white bg-[var(--mega-gradient-btn)] shadow-[0_4px_12px_rgba(255,80,0,0.2)]"
           >
             สั่งสินค้า
           </button>
        </div>
      </div>

    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
