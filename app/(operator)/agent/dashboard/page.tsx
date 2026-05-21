"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Clock,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  ExternalLink,
  UserCheck,
  Calendar,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Button,
  OperatorCard,
  OperatorEmptyState,
  OperatorError,
  OperatorLoading,
  OperatorPageHeader,
  OperatorStatCard,
  OperatorStatusBadge,
  OperatorTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/operator/operator-primitives";

interface AgentProfile {
  id: string;
  linkCode: string;
  displayName: string;
  status: string;
  owner: {
    name: string | null;
    email: string | null;
  };
}

interface RecruitedVendor {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  role: string;
  stores: {
    id: string;
    name: string;
    slug: string;
  }[];
  kycStatus: string;
  kycUpdatedAt: string | null;
}

export default function AgentDashboard() {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [vendors, setVendors] = useState<RecruitedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Edit Link Code state
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editLinkCode, setEditLinkCode] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchDashboardData() {
    try {
      const [agentRes, vendorsRes] = await Promise.all([
        fetch("/api/agents/me"),
        fetch("/api/agents/me/vendors"),
      ]);

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgent(agentData.agent);
        setEditDisplayName(agentData.agent.displayName);
        setEditLinkCode(agentData.agent.linkCode);
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData.vendors);
      }
    } catch (err) {
      console.error("Failed to load agent dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getFullReferralUrl = (code: string) => {
    // Points straight at /apply (the KYC wizard entry), NOT /signup — the
    // invited vendor goes directly into KYC and the account is created at
    // the end (s5/finalize) before redirecting to /signin. The opaque `c=`
    // param (not `ref=`) keeps the agent-referral mechanism invisible.
    if (typeof window !== "undefined") {
      return `${window.location.origin}/apply?c=${code}`;
    }
    return `https://basketplace.co/apply?c=${code}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/agents/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editDisplayName,
          linkCode: editLinkCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setAgent(data.agent);
      setIsEditingLink(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <OperatorLoading label="กำลังโหลดข้อมูลระบบผู้แนะนำร้านค้า..." />;
  }

  if (!agent) {
    return (
      <OperatorError
        title="ไม่พบข้อมูลตัวแทน"
        description="คุณยังไม่มีบัญชีตัวแทนผู้แนะนำในระบบ หรืออาจเกิดข้อผิดพลาดบางประการ"
        action={
          <Button asChild>
            <Link href="/">กลับหน้าหลัก</Link>
          </Button>
        }
      />
    );
  }

  // Calculate statistics
  const totalInvited = vendors.length;
  const completedKyc = vendors.filter((v) => ["AUTO_APPROVED", "MANUAL_REVIEW"].includes(v.kycStatus)).length;
  const pendingKyc = vendors.filter((v) => !["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED", "NOT_STARTED"].includes(v.kycStatus)).length;
  const totalStores = vendors.reduce((acc, curr) => acc + curr.stores.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <OperatorPageHeader
        title={agent.displayName}
        description="ชักชวนร้านค้าใหม่เข้าใช้ระบบ Basketplace ผ่านลิงก์ของคุณ"
        actions={
          <OperatorStatusBadge tone={agent.status === "ACTIVE" ? "success" : "warning"}>
            {agent.status === "ACTIVE" ? "อนุมัติแล้ว (Active)" : "รออนุมัติ (Pending)"}
          </OperatorStatusBadge>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OperatorStatCard label="จำนวนที่เชิญ" value={totalInvited} icon={Users} tone="info" />
        <OperatorStatCard label="ยืนยันตัวตนสำเร็จ" value={completedKyc} icon={UserCheck} tone="success" />
        <OperatorStatCard label="รอยืนยันตัวตน" value={pendingKyc} icon={Clock} tone="warning" />
        <OperatorStatCard label="จำนวนร้านค้าที่สร้าง" value={totalStores} icon={Store} tone="neutral" />
      </section>

      <OperatorCard
        title="ลิงก์แนะนำของคุณ (Referral Link)"
        description="คัดลอกลิงก์ส่งให้ผู้ขายที่ต้องการชักชวน เมื่อผู้ใช้ลงทะเบียนผ่านลิงก์นี้จะผูกกับบัญชีคุณโดยอัตโนมัติ"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2 pl-4">
              <span className="flex-1 truncate font-mono text-xs text-foreground select-all">
                {getFullReferralUrl(agent.linkCode)}
              </span>
              <Button
                type="button"
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={() => copyToClipboard(getFullReferralUrl(agent.linkCode))}
              >
                {copied ? (
                  <>
                    <Check /> คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy /> คัดลอกลิงก์
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="min-w-[240px] border-t pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            {!isEditingLink ? (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase text-muted-foreground">
                    รหัสผู้ใช้แนะนำ (Link Code)
                  </span>
                  <strong className="mt-0.5 block text-2xl tracking-wider text-foreground">
                    {agent.linkCode}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase text-muted-foreground">
                    ชื่อตัวแทนที่แสดง
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-foreground">
                    {agent.displayName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingLink(true)}
                >
                  <Edit2 /> แก้ไขข้อมูลผู้แนะนำ
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    ชื่อตัวแทน (Display Name)
                  </label>
                  <Input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    รหัสผู้แนะนำ (Link Code)
                  </label>
                  <Input
                    type="text"
                    required
                    value={editLinkCode}
                    onChange={(e) => setEditLinkCode(e.target.value)}
                    placeholder="e.g. AGENT101"
                    className="uppercase"
                  />
                </div>

                {editError && (
                  <p className="text-[11px] font-medium leading-relaxed text-destructive">
                    {editError}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save /> บันทึก
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsEditingLink(false);
                      setEditDisplayName(agent.displayName);
                      setEditLinkCode(agent.linkCode);
                      setEditError(null);
                    }}
                  >
                    <X />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </OperatorCard>

      <OperatorTable
        title={`รายชื่อผู้สมัครที่ชักชวนได้ (${vendors.length} คน)`}
        description="ติดตามขั้นตอนการยืนยันตัวตนและการเปิดร้านค้าของสมาชิกที่คุณเชิญชวน"
      >
        {vendors.length === 0 ? (
          <OperatorEmptyState
            icon={Users}
            title="ยังไม่มีผู้สมัครใช้งานผ่านลิงก์ของคุณ"
            description="เริ่มแบ่งปันลิงก์แนะนำของคุณให้กับผู้ขายที่สนใจได้ทันที"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ผู้สมัคร / อีเมล</TableHead>
                <TableHead>วันที่สมัคร</TableHead>
                <TableHead>ขั้นตอน KYC</TableHead>
                <TableHead>ร้านค้าที่เปิด</TableHead>
                <TableHead className="text-center">เอกสาร</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {vendors.map((vendor) => {
                  const isCompleted = ["AUTO_APPROVED", "MANUAL_REVIEW"].includes(vendor.kycStatus);
                  const statusTone =
                    vendor.kycStatus === "AUTO_APPROVED"
                      ? "success"
                      : vendor.kycStatus === "MANUAL_REVIEW"
                        ? "info"
                        : vendor.kycStatus === "REJECTED"
                          ? "danger"
                          : vendor.kycStatus === "NOT_STARTED"
                            ? "neutral"
                            : "warning";
                  return (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{vendor.name || "ยังไม่ระบุชื่อ"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{vendor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar />
                          {new Date(vendor.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <OperatorStatusBadge tone={statusTone}>
                          {vendor.kycStatus === "AUTO_APPROVED" && "KYC ผ่านอัตโนมัติ"}
                          {vendor.kycStatus === "MANUAL_REVIEW" && "ผ่าน (ตรวจด้วยมือ)"}
                          {vendor.kycStatus === "REJECTED" && "ปฏิเสธเอกสาร"}
                          {vendor.kycStatus === "NOT_STARTED" && "ยังไม่ส่งเอกสาร"}
                          {!["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED", "NOT_STARTED"].includes(vendor.kycStatus) && "กำลังตรวจเอกสาร"}
                        </OperatorStatusBadge>
                      </TableCell>
                      <TableCell>
                        {vendor.stores.length === 0 ? (
                          <OperatorStatusBadge>
                            ยังไม่ได้สร้างร้าน
                          </OperatorStatusBadge>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {vendor.stores.map((store) => (
                              <a
                                key={store.id}
                                href={`/stores/${store.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                <Store />
                                {store.name}
                                <ExternalLink />
                              </a>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {["AUTO_APPROVED", "MANUAL_REVIEW"].includes(vendor.kycStatus) ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/agent/vendors/${vendor.id}`}>
                              <Eye />
                              ดูเอกสาร
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </OperatorTable>
    </div>
  );
}
