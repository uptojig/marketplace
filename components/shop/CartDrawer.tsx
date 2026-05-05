"use client";

import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  // สมมติข้อมูลจำลองในตะกร้า (เดี๋ยวจิ๊กค่อยไปผูกกับ Zustand หรือ Context API ของระบบจริง)
  const [items, setItems] = useState([
    { id: 1, name: "รองเท้าวิ่ง SPEEDFORCE (สีดำ, 42)", price: 2390, qty: 1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&q=80" }
  ]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <Drawer>
      {/* 🌟 1. ปุ่ม Trigger (เราจะเอาไปเสียบแทนปุ่มตะกร้าเดิมใน Header) */}
      <DrawerTrigger asChild>
        <button className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {items.length}
            </span>
          )}
        </button>
      </DrawerTrigger>

      {/* 🌟 2. ตัว Drawer ที่จะสไลด์ขึ้นมาจากข้างล่าง */}
      <DrawerContent className="h-[85vh] flex flex-col rounded-t-[24px] bg-white">
        <DrawerHeader className="border-b px-6 py-4 text-left">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingCart className="h-5 w-5" />
              ตะกร้าของคุณ
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* 🌟 3. รายการสินค้า (ไถ Scroll ได้) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-stone-400">
              <ShoppingCart className="h-16 w-16 opacity-20" />
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4 border-stone-100">
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-stone-100 overflow-hidden">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-2 text-sm font-medium text-stone-900">{item.name}</h3>
                      <p className="mt-1 text-sm font-bold text-[var(--shop-primary)]">
                        ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                    {/* ปุ่มปรับจำนวน */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-md border border-stone-200">
                        <button className="px-2 py-1 text-stone-500 hover:text-stone-900"><Minus className="h-3 w-3" /></button>
                        <span className="px-2 text-sm font-medium">{item.qty}</span>
                        <button className="px-2 py-1 text-stone-500 hover:text-stone-900"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button className="text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🌟 4. สรุปยอดและปุ่มชำระเงิน (เกาะติดขอบล่างเสมอ) */}
        {items.length > 0 && (
          <DrawerFooter className="border-t bg-stone-50 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-stone-500">ยอดรวมทั้งหมด</span>
              <span className="text-2xl font-bold text-stone-900">฿{total.toLocaleString()}</span>
            </div>
            <Button size="lg" className="w-full rounded-full h-14 text-lg bg-[var(--shop-primary)] hover:opacity-90">
              ดำเนินการชำระเงิน
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
