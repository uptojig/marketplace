"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Users,
  Search,
  Plus,
  ShieldCheck,
  Ban,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Mail,
  KeyRound,
  RefreshCw,
  Copy,
  PartyPopper,
} from "lucide-react";
import {
  OperatorPageHeader,
  OperatorCard,
  OperatorTable,
  OperatorEmptyState,
  OperatorStatusBadge,
  OperatorFilterChips,
  OperatorField,
  agentStatusTone,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/operator/operator-primitives";
import { OperatorCombobox, type ComboboxOption } from "@/components/operator/operator-combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type NominateMode = "new" | "existing";

export interface AdminAgentRow {
  id: string;
  displayName: string;
  linkCode: string;
  status: string;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
  };
  vendorCount: number;
}

interface CandidateUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface AdminAgentsClientProps {
  initialAgents: AdminAgentRow[];
  candidateUsers: CandidateUser[];
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "พร้อมใช้งาน (Active)",
  PENDING_APPROVAL: "รออนุมัติ (Pending)",
  SUSPENDED: "ระงับการใช้งาน",
};

export function AdminAgentsClient({ initialAgents, candidateUsers }: AdminAgentsClientProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<AdminAgentRow[]>(initialAgents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Nominate agent form state
  const [nominateMode, setNominateMode] = useState<NominateMode>("new");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [nominateDisplayName, setNominateDisplayName] = useState("");
  const [nominateLinkCode, setNominateLinkCode] = useState("");
  const [nominateError, setNominateError] = useState<string | null>(null);
  const [nominating, setNominating] = useState(false);
  const [showNominateForm, setShowNominateForm] = useState(false);

  function resetNominateForm() {
    setNominateMode("new");
    setSelectedUserId("");
    setNewEmail("");
    setNewPassword("");
    setNominateDisplayName("");
    setNominateLinkCode("");
    setNominateError(null);
  }

  function openNominateForm() {
    resetNominateForm();
    setShowNominateForm(true);
  }

  function generatePassword() {
    // Ambiguous chars (0/O, 1/l/I) omitted so it's safe to read aloud / copy.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pwd);
  }

  // General loading states
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  // New-agent credentials are shown in a persistent dialog (not a toast) — they
  // are unrecoverable, so the admin must explicitly copy/close.
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  // Agent pending deletion confirmation (replaces window.confirm).
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ variant: "success", description: `คัดลอก${label}แล้ว` });
    } catch {
      toast({ variant: "destructive", description: `คัดลอก${label}ไม่สำเร็จ` });
    }
  }

  // Filter and search logic
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.linkCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.owner.email && agent.owner.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agent.owner.name && agent.owner.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Memoized combobox options for user picker
  const comboboxOptions: ComboboxOption[] = React.useMemo(
    () =>
      candidateUsers.map((u) => ({
        value: u.id,
        label: u.email || u.id,
        description: u.name || undefined,
      })),
    [candidateUsers]
  );

  // Action handlers
  async function handleStatusChange(agentId: string, newStatus: string) {
    setLoadingIds((prev) => ({ ...prev, [agentId]: true }));
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "เปลี่ยนสถานะไม่สำเร็จ",
          description: errData.detail || `ไม่สามารถเปลี่ยนสถานะเป็น ${newStatus} ได้`,
        });
        return;
      }

      const data = await res.json();
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: data.agent.status } : a))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", description: "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์" });
    } finally {
      setLoadingIds((prev) => ({ ...prev, [agentId]: false }));
    }
  }

  async function performDeleteAgent(agentId: string) {
    setConfirmDeleteId(null);
    setLoadingIds((prev) => ({ ...prev, [agentId]: true }));
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "ลบตัวแทนไม่สำเร็จ",
          description: errData.detail || "ไม่สามารถลบตัวแทนได้",
        });
        return;
      }

      setAgents((prev) => prev.filter((a) => a.id !== agentId));
      toast({ variant: "success", description: "ยกเลิกการเป็นตัวแทนเรียบร้อยแล้ว" });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", description: "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์" });
    } finally {
      setLoadingIds((prev) => ({ ...prev, [agentId]: false }));
    }
  }

  async function handleNominateAgent(e: React.FormEvent) {
    e.preventDefault();
    setNominateError(null);

    let payload: Record<string, unknown>;
    if (nominateMode === "existing") {
      if (!selectedUserId) {
        setNominateError("กรุณาเลือกสมาชิกในระบบ");
        return;
      }
      payload = {
        ownerId: selectedUserId,
        displayName: nominateDisplayName || undefined,
        linkCode: nominateLinkCode || undefined,
      };
    } else {
      const email = newEmail.trim().toLowerCase();
      if (!email) {
        setNominateError("กรุณากรอกอีเมล");
        return;
      }
      if (newPassword.length < 8) {
        setNominateError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
        return;
      }
      payload = {
        email,
        password: newPassword,
        displayName: nominateDisplayName || undefined,
        linkCode: nominateLinkCode || undefined,
      };
    }

    setNominating(true);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "แต่งตั้งตัวแทนไม่สำเร็จ");
      }

      if (nominateMode === "new") {
        // Credentials are unrecoverable — surface them in a persistent dialog
        // with copy buttons (NOT a toast), and defer the reload until the admin
        // closes it so they can't lose the password.
        setShowNominateForm(false);
        setCredentials({ email: newEmail.trim().toLowerCase(), password: newPassword });
      } else {
        toast({
          variant: "success",
          title: "แต่งตั้งตัวแทนสำเร็จ 🎉",
          description: "แต่งตั้งตัวแทนใหม่จากสมาชิกที่มีอยู่เรียบร้อยแล้ว",
        });
        window.location.reload();
      }
    } catch (err) {
      setNominateError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setNominating(false);
    }
  }

  // Count helper
  const pendingCount = agents.filter((a) => a.status === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6">
      <OperatorPageHeader
        title={
          <span className="flex items-center gap-2">
            <Award className="size-6 text-primary" />
            การจัดการตัวแทน (Agents Management)
          </span>
        }
        description="แต่งตั้งและจัดการสิทธิ์ของตัวแทนผู้แนะนำร้านค้าในระบบ"
        actions={
          <Button onClick={openNominateForm}>
            <Plus />
            แต่งตั้งตัวแทนใหม่
          </Button>
        }
      />

      {/* Nomination Modal */}
      <Dialog
        open={showNominateForm}
        onOpenChange={(open) => {
          setShowNominateForm(open);
          if (!open) resetNominateForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>แต่งตั้งตัวแทนใหม่ (Appoint Agent)</DialogTitle>
            <DialogDescription>
              สร้างบัญชีตัวแทนใหม่พร้อมอีเมล/รหัสผ่าน หรือแต่งตั้งจากสมาชิกที่มีอยู่ในระบบ
            </DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(
              [
                { key: "new", label: "สร้างบัญชีใหม่", icon: Mail },
                { key: "existing", label: "เลือกสมาชิกที่มีอยู่", icon: Users },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setNominateMode(key);
                  setNominateError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  nominateMode === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleNominateAgent} className="space-y-4">
            {nominateMode === "existing" ? (
              <OperatorField label="เลือกสมาชิกในระบบ">
                <OperatorCombobox
                  value={selectedUserId}
                  onValueChange={(val) => {
                    setSelectedUserId(val);
                    const selectedUser = candidateUsers.find((u) => u.id === val);
                    if (selectedUser) {
                      setNominateDisplayName(selectedUser.name || "");
                    }
                  }}
                  options={comboboxOptions}
                  placeholder="-- เลือกผู้ใช้งาน --"
                  searchPlaceholder="ค้นหาอีเมล หรือชื่อ..."
                  emptyText="ไม่พบผู้ใช้งานที่ตรงกัน"
                  className="w-full"
                />
              </OperatorField>
            ) : (
              <>
                <OperatorField label="อีเมล (Email)">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="agent@example.com"
                      autoComplete="off"
                      className="pl-9"
                    />
                  </div>
                </OperatorField>

                <OperatorField label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="ตั้งรหัสผ่านให้ตัวแทน"
                        autoComplete="off"
                        className="pl-9 font-mono"
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                      <RefreshCw className="size-4" />
                      สุ่ม
                    </Button>
                  </div>
                </OperatorField>
              </>
            )}

            <OperatorField label="ชื่อที่ใช้แสดง (Display Name)">
              <Input
                value={nominateDisplayName}
                onChange={(e) => setNominateDisplayName(e.target.value)}
                placeholder="ระบุชื่อเรียกในระบบ หรือปล่อยว่าง"
              />
            </OperatorField>

            <OperatorField label="กำหนดรหัส (Link Code - ไม่บังคับ)">
              <Input
                value={nominateLinkCode}
                onChange={(e) => setNominateLinkCode(e.target.value)}
                placeholder="สุ่มให้อัตโนมัติถ้าปล่อยว่าง"
                className="uppercase"
              />
            </OperatorField>

            {nominateError && (
              <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{nominateError}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNominateForm(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={
                  nominating ||
                  (nominateMode === "existing"
                    ? !selectedUserId
                    : !newEmail.trim() || newPassword.length < 8)
                }
              >
                {nominating && <Loader2 className="animate-spin" />}
                แต่งตั้ง
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New-agent credentials — persistent + copy-able (unrecoverable). */}
      <Dialog
        open={!!credentials}
        onOpenChange={(open) => {
          if (!open) {
            setCredentials(null);
            window.location.reload();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="size-5 text-primary" />
              สร้างและแต่งตั้งตัวแทนใหม่สำเร็จ
            </DialogTitle>
            <DialogDescription>
              โปรดคัดลอก/ส่งข้อมูลเข้าสู่ระบบนี้ให้ตัวแทนก่อนปิดหน้าต่าง — รหัสผ่านจะไม่สามารถเรียกดูได้อีก
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">อีเมล</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate font-mono text-sm text-foreground">{credentials?.email}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => credentials && copyText(credentials.email, "อีเมล")}
                  title="คัดลอกอีเมล"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">รหัสผ่าน</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate font-mono text-sm text-foreground">{credentials?.password}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => credentials && copyText(credentials.password, "รหัสผ่าน")}
                  title="คัดลอกรหัสผ่าน"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                credentials &&
                copyText(`อีเมล: ${credentials.email}\nรหัสผ่าน: ${credentials.password}`, "ข้อมูลเข้าสู่ระบบ")
              }
            >
              <Copy className="size-4" />
              คัดลอกทั้งหมด
            </Button>
            <Button
              type="button"
              onClick={() => {
                setCredentials(null);
                window.location.reload();
              }}
            >
              บันทึกแล้ว ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm cancel-agent (replaces window.confirm). */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยกเลิกการเป็นตัวแทน?</DialogTitle>
            <DialogDescription>
              การดำเนินการนี้จะลบโปรไฟล์ตัวแทนและคืนค่าบทบาทผู้ใช้เป็นสมาชิกปกติ ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => confirmDeleteId && performDeleteAgent(confirmDeleteId)}
            >
              <Trash2 className="size-4" />
              ยืนยันลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter and Search */}
      <OperatorCard contentClassName="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ, รหัสแนะนำ, อีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        <OperatorFilterChips
          items={[
            { label: "ทั้งหมด", active: statusFilter === "ALL", onClick: () => setStatusFilter("ALL") },
            { label: "อนุมัติแล้ว", active: statusFilter === "ACTIVE", onClick: () => setStatusFilter("ACTIVE") },
            {
              label: `รออนุมัติ (${pendingCount})`,
              active: statusFilter === "PENDING_APPROVAL",
              onClick: () => setStatusFilter("PENDING_APPROVAL"),
            },
            { label: "ระงับการใช้งาน", active: statusFilter === "SUSPENDED", onClick: () => setStatusFilter("SUSPENDED") },
          ]}
        />
      </OperatorCard>

      {/* Agents Table */}
      {filteredAgents.length === 0 ? (
        <OperatorCard contentClassName="p-0">
          <OperatorEmptyState
            icon={Award}
            title="ไม่พบข้อมูลตัวแทน"
            description="ไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือคัดกรอง"
          />
        </OperatorCard>
      ) : (
        <OperatorTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ตัวแทน / บัญชีเจ้าของ</TableHead>
                <TableHead>Link Code</TableHead>
                <TableHead>ผู้สมัครผ่านลิงก์</TableHead>
                <TableHead>วันที่แต่งตั้ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => {
                const busy = loadingIds[agent.id];
                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{agent.displayName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{agent.owner.email}</p>
                    </TableCell>
                    <TableCell className="font-mono font-bold tracking-wider text-primary">
                      {agent.linkCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="size-4 text-muted-foreground" />
                        <span className="font-bold text-foreground">{agent.vendorCount}</span>
                        <span className="text-xs text-muted-foreground">คน</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(agent.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <OperatorStatusBadge tone={agentStatusTone[agent.status] ?? "neutral"}>
                        {STATUS_LABEL[agent.status] ?? agent.status}
                      </OperatorStatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {agent.status === "PENDING_APPROVAL" && (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => handleStatusChange(agent.id, "ACTIVE")}
                          >
                            <Check />
                            อนุมัติ
                          </Button>
                        )}

                        {agent.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy}
                            onClick={() => handleStatusChange(agent.id, "SUSPENDED")}
                          >
                            <Ban />
                            ระงับสิทธิ์
                          </Button>
                        )}

                        {agent.status === "SUSPENDED" && (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => handleStatusChange(agent.id, "ACTIVE")}
                          >
                            <ShieldCheck />
                            คืนสิทธิ์
                          </Button>
                        )}

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => setConfirmDeleteId(agent.id)}
                          title="ลบตัวแทน"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </OperatorTable>
      )}
    </div>
  );
}
