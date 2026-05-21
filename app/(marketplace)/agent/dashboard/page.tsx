"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Calendar,
  LogOut,
  Eye,
} from "lucide-react";
import { signOut } from "next-auth/react";

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
    if (typeof window !== "undefined") {
      return `${window.location.origin}/signup?ref=${code}`;
    }
    return `https://basketplace.co/signup?ref=${code}`;
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
    return (
      <div className="min-h-screen bg-mp-cream flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-mp-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mp-ink-muted text-sm font-medium">กำลังโหลดข้อมูลระบบผู้แนะนำร้านค้า...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-mp-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-mp-border p-8 max-w-md text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-mp-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold text-mp-ink mb-2">ไม่พบข้อมูลตัวแทน</h2>
          <p className="text-sm text-mp-ink-muted mb-6">
            คุณยังไม่มีบัญชีตัวแทนผู้แนะนำในระบบ หรืออาจเกิดข้อผิดพลาดบางประการ
          </p>
          <Link
            href="/agent/register"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-mp-coral px-6 text-sm font-semibold text-white hover:bg-mp-coral-dark transition-all"
          >
            สมัครเป็นตัวแทน (Agent)
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalInvited = vendors.length;
  const completedKyc = vendors.filter((v) => ["AUTO_APPROVED", "MANUAL_REVIEW"].includes(v.kycStatus)).length;
  const pendingKyc = vendors.filter((v) => !["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED", "NOT_STARTED"].includes(v.kycStatus)).length;
  const totalStores = vendors.reduce((acc, curr) => acc + curr.stores.length, 0);

  return (
    <div className="min-h-screen bg-mp-cream-alt pb-16">
      {/* Header bar */}
      <header className="bg-white border-b border-mp-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-mp-forest text-lg">Basketplace</span>
            <span className="h-4 w-px bg-mp-border" />
            <span className="text-sm font-medium text-mp-ink-muted">ระบบจัดการตัวแทนแนะนำร้านค้า (Agent Console)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              agent.status === "ACTIVE"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {agent.status === "ACTIVE" ? "อนุมัติแล้ว (Active)" : "รออนุมัติ (Pending)"}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-mp-ink-muted hover:text-red-600 p-2 rounded-lg hover:bg-mp-cream transition-all"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-mp-forest to-mp-forest-dark text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-mp-coral">
              ยินดีต้อนรับตัวแทน
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ fontFamily: "var(--mp-font-display)" }}>
              {agent.displayName}
            </h1>
            <p className="text-mp-cream/80 text-sm mt-2 max-w-md">
              ชักชวนร้านค้าใหม่เข้าใช้ระบบ Basketplace ผ่านลิงก์ของคุณ เพื่อสร้างเครือข่ายผู้แนะนำและช่วยเปิดร้านค้าบนระบบของคุณเอง
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <Users className="w-72 h-72" />
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "จำนวนที่เชิญ", value: totalInvited, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "ยืนยันตัวตนสำเร็จ", value: completedKyc, icon: UserCheck, color: "text-green-600 bg-green-50" },
            { label: "รอยืนยันตัวตน", value: pendingKyc, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "จำนวนร้านค้าที่สร้าง", value: totalStores, icon: Store, color: "text-mp-coral bg-mp-coral/10" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-mp-border p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-semibold text-mp-ink-muted">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1.5 text-mp-ink">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Link Management Section */}
        <section className="bg-white rounded-2xl border border-mp-border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <h2 className="text-lg font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>
                ลิงก์แนะนำของคุณ (Referral Link)
              </h2>
              <p className="text-xs text-mp-ink-muted">
                คัดลอกลิงก์ส่งให้ผู้ขายที่ต้องการชักชวน เมื่อผู้ใช้ลงทะเบียนผ่านลิงก์นี้จะผูกกับบัญชีคุณโดยอัตโนมัติ
              </p>

              <div className="flex items-center gap-2 mt-4 max-w-2xl bg-mp-cream border border-mp-border rounded-xl p-2 pl-4">
                <span className="font-mono text-xs text-mp-ink truncate flex-1 select-all">
                  {getFullReferralUrl(agent.linkCode)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getFullReferralUrl(agent.linkCode))}
                  className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-white border border-mp-border hover:bg-mp-cream-alt text-mp-ink"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> คัดลอกแล้ว
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> คัดลอกลิงก์
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-mp-border pt-6 md:pt-0 md:pl-8 min-w-[240px]">
              {!isEditingLink ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-mp-ink-muted block uppercase">
                      รหัสผู้ใช้แนะนำ (Link Code)
                    </span>
                    <strong className="text-2xl text-mp-forest block mt-0.5 tracking-wider">
                      {agent.linkCode}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-mp-ink-muted block uppercase">
                      ชื่อตัวแทนที่แสดง
                    </span>
                    <span className="text-sm font-medium text-mp-ink block mt-0.5">
                      {agent.displayName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingLink(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-mp-coral font-bold hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> แก้ไขข้อมูลผู้แนะนำ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-mp-ink mb-1">
                      ชื่อตัวแทน (Display Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full h-9 rounded-lg border border-mp-border bg-white px-3 text-xs text-mp-ink focus:border-mp-coral focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mp-ink mb-1">
                      รหัสผู้แนะนำ (Link Code)
                    </label>
                    <input
                      type="text"
                      required
                      value={editLinkCode}
                      onChange={(e) => setEditLinkCode(e.target.value)}
                      placeholder="e.g. AGENT101"
                      className="w-full h-9 rounded-lg border border-mp-border bg-white px-3 text-xs text-mp-ink uppercase focus:border-mp-coral focus:outline-none"
                    />
                  </div>

                  {editError && (
                    <p className="text-[11px] text-red-600 font-medium leading-relaxed">
                      {editError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 h-9 bg-mp-forest text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-mp-forest-dark disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> บันทึก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingLink(false);
                        setEditDisplayName(agent.displayName);
                        setEditLinkCode(agent.linkCode);
                        setEditError(null);
                      }}
                      className="h-9 px-3 bg-white border border-mp-border text-mp-ink rounded-lg text-xs font-semibold flex items-center justify-center hover:bg-mp-cream"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Recruited Vendors Table */}
        <section className="bg-white rounded-2xl border border-mp-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-mp-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>
                รายชื่อผู้สมัครที่ชักชวนได้ ({vendors.length} คน)
              </h2>
              <p className="text-xs text-mp-ink-muted">
                ติดตามขั้นตอนการยืนยันตัวตนและการเปิดร้านค้าของสมาชิกที่คุณเชิญชวน
              </p>
            </div>
          </div>

          {vendors.length === 0 ? (
            <div className="p-12 text-center text-mp-ink-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-mp-ink" />
              <p className="text-sm font-medium">ยังไม่มีผู้สมัครใช้งานผ่านลิงก์ของคุณ</p>
              <p className="text-xs opacity-80 mt-1">เริ่มแบ่งปันลิงก์แนะนำของคุณให้กับผู้ขายที่สนใจได้ทันที!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-mp-cream/60 text-mp-ink-muted text-xs font-semibold border-b border-mp-border">
                    <th className="px-6 py-4">ผู้สมัคร / อีเมล</th>
                    <th className="px-6 py-4">วันที่สมัคร</th>
                    <th className="px-6 py-4">ขั้นตอน KYC</th>
                    <th className="px-6 py-4">ร้านค้าที่เปิด</th>
                    <th className="px-6 py-4 text-center">เอกสาร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mp-border/60">
                  {vendors.map((vendor) => {
                    const isCompleted = ["AUTO_APPROVED", "MANUAL_REVIEW"].includes(vendor.kycStatus);
                    return (
                      <tr key={vendor.id} className="hover:bg-mp-cream/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-mp-ink">{vendor.name || "ยังไม่ระบุชื่อ"}</p>
                            <p className="text-xs text-mp-ink-muted mt-0.5">{vendor.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-mp-ink-muted">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(vendor.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            vendor.kycStatus === "AUTO_APPROVED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : vendor.kycStatus === "MANUAL_REVIEW"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : vendor.kycStatus === "REJECTED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : vendor.kycStatus === "NOT_STARTED"
                              ? "bg-gray-50 text-gray-700 border-gray-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {vendor.kycStatus === "AUTO_APPROVED" && "KYC ผ่านอัตโนมัติ"}
                            {vendor.kycStatus === "MANUAL_REVIEW" && "ผ่าน (ตรวจด้วยมือ)"}
                            {vendor.kycStatus === "REJECTED" && "ปฏิเสธเอกสาร"}
                            {vendor.kycStatus === "NOT_STARTED" && "ยังไม่ส่งเอกสาร"}
                            {!["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED", "NOT_STARTED"].includes(vendor.kycStatus) && "กำลังตรวจเอกสาร"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {vendor.stores.length === 0 ? (
                            <span className="text-xs text-mp-ink-muted bg-mp-cream/60 border border-mp-border px-2 py-0.5 rounded">
                              ยังไม่ได้สร้างร้าน
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {vendor.stores.map((store) => (
                                <a
                                  key={store.id}
                                  href={`/stores/${store.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-mp-forest font-semibold hover:underline hover:text-mp-coral"
                                >
                                  <Store className="w-3.5 h-3.5 shrink-0" />
                                  {store.name}
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </a>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {["AUTO_APPROVED", "MANUAL_REVIEW"].includes(vendor.kycStatus) ? (
                            <Link
                              href={`/agent/vendors/${vendor.id}`}
                              className="inline-flex items-center gap-1 text-xs text-mp-coral font-semibold hover:underline"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              ดูเอกสาร
                            </Link>
                          ) : (
                            <span className="text-[10px] text-mp-ink-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
