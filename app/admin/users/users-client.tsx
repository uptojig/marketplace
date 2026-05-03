"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Role = "ADMIN" | "VENDOR" | "CUSTOMER";

export type AdminUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  createdAt: string; // ISO string (server serializes Date)
  store: { slug: string; name: string } | null;
  orderCount: number;
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700",
  VENDOR: "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

const ROLES: Role[] = ["CUSTOMER", "VENDOR", "ADMIN"];

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ผู้ใช้ทั้งหมด</h1>
          <p className="text-sm text-muted-foreground">{users.length} คน</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> สร้างผู้ใช้
        </button>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ค้นหา
        </button>
      </form>

      {toast && (
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
            toast.ok
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">อีเมล / ชื่อ</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3 text-center">ออเดอร์</th>
              <th className="px-4 py-3">สมัครเมื่อ</th>
              <th className="px-4 py-3 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  ไม่พบผู้ใช้
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isMe = u.id === meId;
                const isPending = pendingId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {u.email ?? "—"}
                        {isMe && (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                            คุณ
                          </span>
                        )}
                      </p>
                      {u.name && (
                        <p className="text-xs text-muted-foreground">
                          {u.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                        >
                          {u.role}
                        </span>
                        <select
                          value={u.role}
                          onChange={(e) =>
                            changeRole(u.id, e.target.value as Role)
                          }
                          disabled={isPending}
                          className="rounded border px-1 py-0.5 text-xs disabled:bg-gray-100"
                          aria-label="Change role"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {u.store ? (
                        <span>{u.store.name}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{u.orderCount}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPending ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin text-stone-400" />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            deleteUser(u.id, u.email ?? u.name ?? u.id)
                          }
                          disabled={isMe}
                          className="rounded p-1 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Delete"
                          title={isMe ? "ลบบัญชีตัวเองไม่ได้" : "ลบ"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(user) => {
            setShowCreate(false);
            setUsers((prev) => [
              {
                ...user,
                store: null,
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
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) {
      setErr("กรอกอีเมล");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">สร้างผู้ใช้ใหม่</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">อีเมล *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
              placeholder="user@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">ชื่อ (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
              placeholder="คุณนัท"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={busy}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {err && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              <AlertCircle className="h-4 w-4" /> {err}
            </div>
          )}
          <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            ผู้ใช้ที่สร้างใหม่จะ login ผ่าน Google หรือ email magic-link
            ที่อีเมลเดียวกันได้เลย — ไม่มีการส่ง invite email อัตโนมัติ
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              สร้าง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
