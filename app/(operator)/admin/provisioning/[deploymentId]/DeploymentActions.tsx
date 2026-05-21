"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  OperatorDangerZone,
} from "@/components/operator/operator-primitives";

type Props = {
  storeId: string;
  storeSlug: string;
  status: string;
};

export default function DeploymentActions({ storeId, storeSlug, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [showDestroy, setShowDestroy] = useState(false);

  async function resume() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/provisioner/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ? JSON.stringify(d.error) : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (confirmSlug !== storeSlug) {
      setErr("พิมพ์ slug ให้ตรงเพื่อยืนยัน");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/provisioner/deprovision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, confirmSlug }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ? JSON.stringify(d.error) : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const canResume = status === "FAILED" || status === "PENDING";

  return (
    <div className="space-y-3 text-sm">
      {canResume && (
        <Button onClick={resume} disabled={busy} className="w-full">
          <RotateCw />
          Resume / Retry provisioning
        </Button>
      )}

      {!showDestroy ? (
        <Button
          variant="outline"
          onClick={() => setShowDestroy(true)}
          className="w-full text-destructive hover:bg-destructive/10"
        >
          <Trash2 />
          Destroy droplet…
        </Button>
      ) : (
        <OperatorDangerZone
          title="ทำลาย Droplet"
          description={
            <>
              พิมพ์ slug <code className="rounded bg-card px-1">{storeSlug}</code> เพื่อยืนยัน — droplet
              จะถูกลบและ IP จะถูกปล่อย
            </>
          }
        >
          <div className="space-y-2">
            <Input
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              placeholder={storeSlug}
              disabled={busy}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={destroy}
                disabled={busy || confirmSlug !== storeSlug}
                className="flex-1"
              >
                ทำลาย Droplet
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDestroy(false);
                  setConfirmSlug("");
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </OperatorDangerZone>
      )}

      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
