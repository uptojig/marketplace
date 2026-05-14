"use client";

// Vendor-facing CTAs on the order detail page.
//
// Three buttons, conditionally rendered by the parent server component
// based on the current order status:
//   - MarkShippedDialog: PAID / SUPPLIER_PLACED → SHIPPED + tracking
//   - MarkDeliveredButton: SHIPPED → DELIVERED
//   - CancelOrderButton:   PENDING_PAYMENT / PAID / SUPPLIER_PLACED → CANCELLED
//
// All three call the corresponding server actions in
// lib/orders/server-actions.ts. The server actions enforce
// authorization + transition validity again — these buttons are just
// the happy-path affordance.

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cancelOrderAsVendor,
  markOrderDelivered,
  markOrderShipped,
  type ShippingCarrier,
} from "@/lib/orders/server-actions";

interface CommonProps {
  orderId: string;
}

const CARRIERS: { value: ShippingCarrier; label: string }[] = [
  { value: "KERRY", label: "Kerry Express" },
  { value: "FLASH", label: "Flash Express" },
  { value: "JNT", label: "J&T Express" },
  { value: "OTHER", label: "อื่นๆ" },
];

// localStorage key for the vendor's last-used shipping carrier.
// Stored as the raw enum string so a future ShippingCarrier addition
// just needs the parse guard below extended. Per-browser, per-device
// — not synced server-side because shipping habits are op-specific
// and the persistence is just a nicety, not a source of truth.
const CARRIER_PREF_KEY = "dashboard:lastShippingCarrier";

function isCarrier(v: string | null): v is ShippingCarrier {
  return v === "KERRY" || v === "FLASH" || v === "JNT" || v === "OTHER";
}

export function MarkShippedDialog({ orderId }: CommonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Default to KERRY on first paint so SSR-rendered output matches
  // the initial client render; useEffect below promotes the stored
  // preference once we're on the client.
  const [carrier, setCarrier] = useState<ShippingCarrier>("KERRY");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Hydrate stored carrier preference on mount. Wrapped in try/catch
  // because localStorage can throw in private-browsing / Safari
  // edge cases — a missing preference is fine, we just fall back to
  // the KERRY default.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CARRIER_PREF_KEY);
      if (isCarrier(stored)) setCarrier(stored);
    } catch {
      /* localStorage unavailable — keep default */
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = trackingNumber.trim();
    if (!trimmed) {
      setError("กรุณากรอกเลขพัสดุ");
      return;
    }
    startTransition(async () => {
      const result = await markOrderShipped(orderId, {
        trackingNumber: trimmed,
        shippingCarrier: carrier,
      });
      if (!result.ok) {
        setError(translateError(result.error));
        return;
      }
      // Persist the carrier choice only on a SUCCESSFUL ship — keeps
      // the preference aligned with what the vendor actually uses,
      // not what they idly clicked through.
      try {
        window.localStorage.setItem(CARRIER_PREF_KEY, carrier);
      } catch {
        /* localStorage unavailable — preference doesn't persist */
      }
      setOpen(false);
      setTrackingNumber("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Truck className="mr-1.5 h-4 w-4" />
          ยืนยันจัดส่ง
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการจัดส่ง</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลพัสดุเพื่อแจ้งลูกค้าว่าสินค้าออกเดินทางแล้ว
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shipping-carrier">บริษัทขนส่ง</Label>
            <select
              id="shipping-carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as ShippingCarrier)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={pending}
            >
              {CARRIERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tracking-number">เลขพัสดุ</Label>
            <Input
              id="tracking-number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="เช่น TH1234567890"
              disabled={pending}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                ยกเลิก
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MarkDeliveredButton({ orderId }: CommonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await markOrderDelivered(orderId);
      if (!result.ok) {
        setError(translateError(result.error));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button variant="outline" onClick={handleClick} disabled={pending}>
        {pending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
        )}
        ยืนยันส่งถึงลูกค้า
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function CancelOrderButton({ orderId }: CommonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrderAsVendor(orderId);
      if (!result.ok) {
        setError(translateError(result.error));
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
        >
          <XCircle className="mr-1.5 h-4 w-4" />
          ยกเลิกคำสั่งซื้อ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการยกเลิกคำสั่งซื้อ</DialogTitle>
          <DialogDescription>
            การยกเลิกจะแจ้งลูกค้าและไม่สามารถย้อนกลับได้ — หากชำระเงินแล้ว
            ระบบจะดำเนินการคืนเงินภายใน 3-5 วันทำการ
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              ปิด
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            ยืนยันยกเลิก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function translateError(code: string | undefined): string {
  switch (code) {
    case "unauthorized":
      return "กรุณาเข้าสู่ระบบอีกครั้ง";
    case "not_found":
      return "ไม่พบคำสั่งซื้อ";
    case "invalid_transition":
      return "ไม่สามารถเปลี่ยนสถานะของคำสั่งซื้อนี้ได้";
    case "tracking_required":
      return "กรุณากรอกเลขพัสดุ";
    case "invalid_carrier":
      return "กรุณาเลือกบริษัทขนส่งที่ถูกต้อง";
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
}
