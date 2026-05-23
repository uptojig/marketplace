"use client";

/**
 * Danger tab — destructive operations gated behind <ConfirmAction>'s
 * type-to-confirm dialog. Currently hosts "Delete store"; future
 * destructive ops (transfer ownership, force-teardown deployment, etc.)
 * land here too.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/operator/confirm-action";

export type DangerStore = {
  id: string;
  slug: string;
  name: string;
};

export function DangerSection({ store }: { store: DangerStore }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    setErr(null);
    const res = await fetch(`/api/admin/stores/${store.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "ลบไม่สำเร็จ");
    }
    router.push("/admin/stores");
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-red-200 bg-red-50/30 p-5">
      <h2 className="font-semibold text-red-900">โซนอันตราย</h2>
      <p className="mt-1 text-xs text-red-900/80">
        การกระทำในส่วนนี้ย้อนกลับไม่ได้ — ทำเฉพาะตอนที่แน่ใจจริงๆ
      </p>

      <div className="mt-4 flex items-start justify-between gap-4 rounded-md border border-red-300 bg-white p-4">
        <div>
          <h3 className="text-sm font-semibold text-red-900">ลบร้านนี้ถาวร</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            สินค้าและออเดอร์ทั้งหมดที่อยู่ใน ProductVariant/OrderItem ของร้าน
            นี้จะถูกลบตาม ระบบจะถอน DO droplet + CF DNS records ก่อนลบ row
            ใน DB
          </p>
          {err && (
            <p className="mt-2 text-xs text-red-700" role="alert">
              {err}
            </p>
          )}
        </div>
        <ConfirmAction
          trigger={
            <Button variant="destructive" size="sm">
              <Trash2 className="h-3.5 w-3.5" />
              ลบร้านนี้
            </Button>
          }
          title={`ลบร้าน "${store.name}" ถาวร?`}
          description={
            <>
              สินค้าและออเดอร์ทั้งหมดที่อยู่ใน ProductVariant/OrderItem ของ
              ร้านนี้จะถูกลบตาม การกระทำนี้ย้อนกลับไม่ได้
            </>
          }
          confirmPhrase={store.slug}
          confirmLabel="ลบถาวร"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </section>
  );
}
