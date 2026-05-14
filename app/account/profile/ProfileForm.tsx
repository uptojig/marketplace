'use client';

import { useState } from 'react';
import { Camera, KeyRound, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { UserProfile } from '@/lib/account/mock-data';

export default function ProfileForm({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [email] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const save = () => {
    // Real impl: server action
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold lg:text-2xl">โปรไฟล์</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={name} />
              <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground hover:opacity-90"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-xs text-muted-foreground">
              สมาชิกตั้งแต่{' '}
              {new Date(user.joinedAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">ข้อมูลส่วนตัว</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1 text-xs">ชื่อ-นามสกุล</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 text-xs">อีเมล</Label>
            <Input value={email} disabled className="bg-muted" />
            <p className="mt-1 text-[10px] text-muted-foreground">
              เปลี่ยนอีเมลไม่ได้ ติดต่อทีมงานหากต้องเปลี่ยน
            </p>
          </div>
          <div>
            <Label className="mb-1 text-xs">เบอร์โทร</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save}>บันทึก</Button>
          {saved && <span className="text-xs text-green-600">บันทึกแล้ว</span>}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">ความปลอดภัย</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <KeyRound className="mr-2 h-4 w-4" /> เปลี่ยนรหัสผ่าน
          </Button>
          <Button variant="outline" className="w-full justify-start">
            ตั้งค่ายืนยันตัวตน 2 ขั้นตอน (2FA)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            ดูประวัติการเข้าใช้งาน
          </Button>
        </div>
      </Card>

      <Card className="border-destructive/40 p-6">
        <h3 className="mb-2 font-semibold text-destructive">โซนอันตราย</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          การลบบัญชีจะลบข้อมูลทั้งหมดอย่างถาวร รวมถึงคำสั่งซื้อ ที่อยู่ และรีวิว
        </p>
        <Separator className="mb-4" />
        <Button variant="outline" className="text-destructive hover:bg-destructive/5">
          <Trash2 className="mr-2 h-4 w-4" /> ลบบัญชี
        </Button>
      </Card>
    </div>
  );
}
