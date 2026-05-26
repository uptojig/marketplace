"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Button,
  Input,
  OperatorEmptyState,
  OperatorField,
  OperatorPageHeader,
  OperatorStatusBadge,
  OperatorTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type StatusTone,
} from "@/components/operator/operator-primitives";

type Role = "ADMIN" | "VENDOR" | "AGENT" | "CUSTOMER";

export type AdminUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  createdAt: string; // ISO string (server serializes Date)
  store: { slug: string; name: string } | null;
  /**
   * Stores the user has bought from, derived from Order.storeId.
   * Populated for customers (and any non-vendor users with order
   * history). Empty list means "no purchases yet". Vendors typically
   * have an owned `store` set, which takes display precedence.
   */
  purchaseStores: { slug: string; name: string }[];
  orderCount: number;
};

const ROLE_TONE: Record<Role, StatusTone> = {
  ADMIN: "danger",
  VENDOR: "success",
  AGENT: "info",
  CUSTOMER: "neutral",
};

const ROLES: Role[] = ["CUSTOMER", "VENDOR", "AGENT", "ADMIN"];

export function AdminUsersClient({
  initialUsers,
  meId,
  query,
}: {
  initialUsers: AdminUserRow[];
  /** Current admin's user ID — used to disable self-demotion / self-delete in UI. */
  meId: string;
  query: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function flash(ok: boolean, msg: string) {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function changeRole(userId: string, newRole: Role) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash(false, data?.detail ?? data?.error ?? "เปลี่ยน role ไม่สำเร็จ");
        return;
      }
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      flash(true, `เปลี่ยน role เป็น ${newRole} เรียบร้อย`);
    } catch (e) {
      flash(false, e instanceof Error ? e.message : "network error");
    } finally {
      setPendingId(null);
    }
  }

  async function deleteUser(userId: string, label: string) {
    if (!confirm(`ลบผู้ใช้ ${label}?\nการลบไม่สามารถย้อนกลับได้`)) return;
    setPendingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash(false, data?.detail ?? data?.error ?? "ลบไม่สำเร็จ");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      flash(true, "ลบผู้ใช้เรียบร้อย");
    } catch (e) {
      flash(false, e instanceof Error ? e.message : "network error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <OperatorPageHeader
        title="ผู้ใช้ทั้งหมด"
        description={`${users.length} คน`}
        actions={
          <Button type="button" onClick={() => setShowCreate(true)}>
            <Plus />
            สร้างผู้ใช้
          </Button>
        }
      />

      <form className="flex gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          className="flex-1"
        />
        <Button type="submit" variant="outline">
          ค้นหา
        </Button>
      </form>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-card-foreground">
          {toast.ok ? (
            <CheckCircle2 className="text-emerald-600" />
          ) : (
            <AlertCircle className="text-destructive" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <OperatorTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>อีเมล / ชื่อ</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>ร้าน</TableHead>
              <TableHead className="text-center">ออเดอร์</TableHead>
              <TableHead>สมัครเมื่อ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <OperatorEmptyState title="ไม่พบผู้ใช้" />
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const isMe = u.id === meId;
                const isPending = pendingId === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {u.email ?? "-"}
                        {isMe && (
                          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                            คุณ
                          </span>
                        )}
                      </p>
                      {u.name && (
                        <p className="text-xs text-muted-foreground">{u.name}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <OperatorStatusBadge tone={ROLE_TONE[u.role]}>
                          {u.role}
                        </OperatorStatusBadge>
                        <Select
                          value={u.role}
                          onValueChange={(val) => changeRole(u.id, val as Role)}
                          disabled={isPending}
                        >
                          <SelectTrigger size="sm" className="w-[112px]" aria-label="Change role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.store ? (
                        <span className="font-medium text-foreground">{u.store.name}</span>
                      ) : u.purchaseStores.length > 0 ? (
                        <span
                          className="font-medium text-foreground"
                          title={u.purchaseStores.map((s) => s.name).join(", ")}
                        >
                          {u.purchaseStores
                            .slice(0, 2)
                            .map((s) => s.name)
                            .join(", ")}
                          {u.purchaseStores.length > 2 && (
                            <span className="ml-1 font-normal text-muted-foreground">
                              +{u.purchaseStores.length - 2} more
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{u.orderCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPending ? (
                        <Loader2 className="ml-auto animate-spin text-muted-foreground" />
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteUser(u.id, u.email ?? u.name ?? u.id)}
                          disabled={isMe}
                          aria-label="Delete"
                          title={isMe ? "ลบบัญชีตัวเองไม่ได้" : "ลบ"}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </OperatorTable>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(user) => {
            setShowCreate(false);
            setUsers((prev) => [
              {
                ...user,
                store: null,
                purchaseStores: [],
                orderCount: 0,
                createdAt: user.createdAt,
              },
              ...prev,
            ]);
            flash(true, `สร้างผู้ใช้ ${user.email} เรียบร้อย`);
            // Refresh to pick up any server-side concerns we missed
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (u: AdminUserRow) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) {
      setErr("กรอกอีเมล");
      return;
    }
    if (password && password.length < 8) {
      setErr("รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร (หรือเว้นไว้)");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          role,
          password: password || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.detail ?? data?.error ?? "สร้างไม่สำเร็จ");
        return;
      }
      onCreated(data.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>สร้างผู้ใช้ใหม่</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <OperatorField label="อีเมล" required>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              placeholder="user@example.com"
            />
          </OperatorField>
          <OperatorField label="ชื่อ (optional)">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              placeholder="คุณนัท"
            />
          </OperatorField>
          <OperatorField label="Role">
            <Select value={role} onValueChange={(v) => setRole(v as Role)} disabled={busy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </OperatorField>
          <OperatorField label="รหัสผ่านเริ่มต้น (optional)">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              autoComplete="new-password"
              minLength={8}
              placeholder="อย่างน้อย 8 ตัว เว้นว่าง = ใช้ Google/magic-link เท่านั้น"
            />
          </OperatorField>
          {err && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" /> {err}
            </div>
          )}
          <div className="rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            ถ้าตั้งรหัสผ่าน → user login ที่ /signin ด้วยอีเมล + รหัสผ่านได้ทันที
            <br />
            ถ้าเว้นว่าง → user ต้อง login ผ่าน Google หรือ email magic-link
            (ไม่มี invite email อัตโนมัติ)
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              สร้าง
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
