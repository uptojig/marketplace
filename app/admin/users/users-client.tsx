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

type Role = "ADMIN" | "VENDOR" | "AGENT" | "CUSTOMER";

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
  ADMIN: "bg-red-50 text-red-700 border border-red-100",
  VENDOR: "bg-mp-forest/10 text-mp-forest",
  AGENT: "bg-mp-coral/10 text-mp-coral",
  CUSTOMER: "bg-mp-cream-alt text-mp-ink-muted",
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
    <div className="space-y-4 text-mp-ink">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>ผู้ใช้ทั้งหมด</h1>
          <p className="text-sm text-mp-ink-muted">{users.length} คน</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-mp-coral px-4 py-2 text-sm font-semibold text-white hover:bg-mp-coral-dark shadow-sm transition"
        >
          <Plus className="h-4 w-4" /> สร้างผู้ใช้
        </button>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          className="flex-1 rounded-xl border border-mp-border bg-mp-surface px-3 py-2 text-sm text-mp-ink placeholder-mp-ink-muted focus:outline-none focus:ring-2 focus:ring-mp-coral/20"
        />
        <button
          type="submit"
          className="rounded-xl border border-mp-border bg-mp-surface px-4 py-2 text-sm font-semibold text-mp-ink hover:bg-mp-cream-alt transition"
        >
          ค้นหา
        </button>
      </form>

      {toast && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
            toast.ok
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-mp-border bg-mp-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-mp-border bg-mp-cream-alt text-left text-xs font-medium uppercase tracking-wide text-mp-ink-muted">
            <tr>
              <th className="px-4 py-3">อีเมล / ชื่อ</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3 text-center">ออเดอร์</th>
              <th className="px-4 py-3">สมัครเมื่อ</th>
              <th className="px-4 py-3 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mp-border">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-mp-ink-muted"
                >
                  ไม่พบผู้ใช้
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isMe = u.id === meId;
                const isPending = pendingId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-mp-cream-alt/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-mp-ink">
                        {u.email ?? "—"}
                        {isMe && (
                          <span className="ml-2 rounded bg-mp-coral/10 px-1.5 py-0.5 text-xs font-medium text-mp-coral">
                            คุณ
                          </span>
                        )}
                      </p>
                      {u.name && (
                        <p className="text-xs text-mp-ink-muted">
                          {u.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium border ${ROLE_BADGE[u.role]}`}
                        >
                          {u.role}
                        </span>
                        <select
                          value={u.role}
                          onChange={(e) =>
                            changeRole(u.id, e.target.value as Role)
                          }
                          disabled={isPending}
                          className="rounded-lg border border-mp-border bg-mp-surface px-1.5 py-0.5 text-xs text-mp-ink focus:outline-none focus:ring-1 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt"
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
                        <span className="font-medium text-mp-ink">{u.store.name}</span>
                      ) : (
                        <span className="text-mp-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{u.orderCount}</td>
                    <td className="px-4 py-3 text-xs text-mp-ink-muted">
                      {new Date(u.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPending ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin text-mp-ink-muted" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-mp-border bg-mp-surface p-5 shadow-xl text-mp-ink">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>สร้างผู้ใช้ใหม่</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-mp-cream-alt text-mp-ink-muted transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-mp-ink">อีเมล *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="mt-1 w-full rounded-xl border border-mp-border bg-mp-surface text-mp-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt"
              placeholder="user@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-mp-ink">ชื่อ (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              className="mt-1 w-full rounded-xl border border-mp-border bg-mp-surface text-mp-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt"
              placeholder="คุณนัท"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-mp-ink">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={busy}
              className="mt-1 w-full rounded-xl border border-mp-border bg-mp-surface text-mp-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-mp-ink">
              รหัสผ่านเริ่มต้น (optional)
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              autoComplete="new-password"
              minLength={8}
              className="mt-1 w-full rounded-xl border border-mp-border bg-mp-surface text-mp-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mp-coral/20 disabled:bg-mp-cream-alt"
              placeholder="อย่างน้อย 8 ตัว เว้นว่าง = ใช้ Google/magic-link เท่านั้น"
            />
          </label>
          {err && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              <AlertCircle className="h-4 w-4" /> {err}
            </div>
          )}
          <div className="rounded-xl border border-mp-border/50 bg-mp-cream-alt/60 px-3 py-2 text-xs text-mp-ink-muted">
            ถ้าตั้งรหัสผ่าน → user login ที่ /signin ด้วยอีเมล + รหัสผ่านได้ทันที
            <br />
            ถ้าเว้นว่าง → user ต้อง login ผ่าน Google หรือ email magic-link
            (ไม่มี invite email อัตโนมัติ)
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-mp-border bg-mp-surface px-4 py-2 text-sm font-semibold text-mp-ink hover:bg-mp-cream-alt disabled:opacity-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 rounded-xl bg-mp-coral px-4 py-2 text-sm font-semibold text-white hover:bg-mp-coral-dark disabled:opacity-50 shadow-sm transition"
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
