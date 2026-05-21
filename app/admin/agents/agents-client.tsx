"use client";

import { useState } from "react";
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
} from "lucide-react";

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

export function AdminAgentsClient({ initialAgents, candidateUsers }: AdminAgentsClientProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<AdminAgentRow[]>(initialAgents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Nominate agent form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [nominateDisplayName, setNominateDisplayName] = useState("");
  const [nominateLinkCode, setNominateLinkCode] = useState("");
  const [nominateError, setNominateError] = useState<string | null>(null);
  const [nominating, setNominating] = useState(false);
  const [showNominateForm, setShowNominateForm] = useState(false);

  // General loading states
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

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
        alert(errData.detail || `ไม่สามารถเปลี่ยนสถานะเป็น ${newStatus} ได้`);
        return;
      }

      const data = await res.json();
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: data.agent.status } : a))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์");
    } finally {
      setLoadingIds((prev) => ({ ...prev, [agentId]: false }));
    }
  }

  async function handleDeleteAgent(agentId: string) {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเป็นตัวแทน? การดำเนินการนี้จะลบโปรไฟล์ตัวแทนและคืนค่าบทบาทผู้ใช้เป็นสมาชิกปกติ")) {
      return;
    }

    setLoadingIds((prev) => ({ ...prev, [agentId]: true }));
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "ไม่สามารถลบตัวแทนได้");
        return;
      }

      setAgents((prev) => prev.filter((a) => a.id !== agentId));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์");
    } finally {
      setLoadingIds((prev) => ({ ...prev, [agentId]: false }));
    }
  }

  async function handleNominateAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    setNominateError(null);
    setNominating(true);

    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: selectedUserId,
          displayName: nominateDisplayName || undefined,
          linkCode: nominateLinkCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "แต่งตั้งตัวแทนไม่สำเร็จ");
      }

      // Refresh list
      alert("แต่งตั้งตัวแทนใหม่สำเร็จแล้ว 🎉");
      window.location.reload();
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
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            การจัดการตัวแทน (Agents Management)
          </h1>
          <p className="text-sm text-gray-500">
            แต่งตั้งและจัดการสิทธิ์ของตัวแทนผู้แนะนำร้านค้าในระบบ
          </p>
        </div>

        <button
          onClick={() => setShowNominateForm(!showNominateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          แต่งตั้งตัวแทนใหม่
        </button>
      </div>

      {/* Nomination Form Drawer / Card */}
      {showNominateForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">แต่งตั้งตัวแทนใหม่ (Appoint Agent)</h2>
            <button
              onClick={() => {
                setShowNominateForm(false);
                setNominateError(null);
              }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ยกเลิก
            </button>
          </div>

          <form onSubmit={handleNominateAgent} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                เลือกสมาชิกในระบบ
              </label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  const selectedUser = candidateUsers.find((u) => u.id === e.target.value);
                  if (selectedUser) {
                    setNominateDisplayName(selectedUser.name || "");
                  }
                }}
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- เลือกผู้ใช้งาน --</option>
                {candidateUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} {user.name ? `(${user.name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                ชื่อที่ใช้แสดง (Display Name)
              </label>
              <input
                type="text"
                value={nominateDisplayName}
                onChange={(e) => setNominateDisplayName(e.target.value)}
                placeholder="ระบุชื่อเรียกในระบบ หรือปล่อยว่าง"
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  กำหนดรหัส (Link Code - ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={nominateLinkCode}
                  onChange={(e) => setNominateLinkCode(e.target.value)}
                  placeholder="สุ่มให้อัตโนมัติถ้าปล่อยว่าง"
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={nominating || !selectedUserId}
                className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shadow-sm"
              >
                {nominating && <Loader2 className="w-4 h-4 animate-spin" />}
                แต่งตั้ง
              </button>
            </div>
          </form>

          {nominateError && (
            <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{nominateError}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสแนะนำ, อีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: "ทั้งหมด" },
            { id: "ACTIVE", label: "อนุมัติแล้ว" },
            { id: "PENDING_APPROVAL", label: `รออนุมัติ (${pendingCount})` },
            { id: "SUSPENDED", label: "ระงับการใช้งาน" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                statusFilter === filter.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredAgents.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-900" />
            <p className="text-base font-semibold">ไม่พบข้อมูลตัวแทน</p>
            <p className="text-xs text-gray-400 mt-1">ไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือคัดกรอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-200">
                  <th className="px-6 py-4">ตัวแทน / บัญชีเจ้าของ</th>
                  <th className="px-6 py-4">Link Code</th>
                  <th className="px-6 py-4">ผู้สมัครผ่านลิงก์</th>
                  <th className="px-6 py-4">วันที่แต่งตั้ง</th>
                  <th className="px-6 py-4">สถานะ</th>
                  <th className="px-6 py-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAgents.map((agent) => {
                  const busy = loadingIds[agent.id];
                  return (
                    <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{agent.displayName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{agent.owner.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700 tracking-wider">
                        {agent.linkCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-700">{agent.vendorCount}</span>
                          <span className="text-xs text-gray-400">คน</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(agent.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          agent.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : agent.status === "PENDING_APPROVAL"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {agent.status === "ACTIVE" && "พร้อมใช้งาน (Active)"}
                          {agent.status === "PENDING_APPROVAL" && "รออนุมัติ (Pending)"}
                          {agent.status === "SUSPENDED" && "ระงับการใช้งาน"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {agent.status === "PENDING_APPROVAL" && (
                            <button
                              disabled={busy}
                              onClick={() => handleStatusChange(agent.id, "ACTIVE")}
                              className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-all shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> อนุมัติ
                            </button>
                          )}

                          {agent.status === "ACTIVE" && (
                            <button
                              disabled={busy}
                              onClick={() => handleStatusChange(agent.id, "SUSPENDED")}
                              className="h-8 px-3 border border-red-200 hover:bg-red-50 text-red-700 rounded-md text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-all"
                            >
                              <Ban className="w-3.5 h-3.5" /> ระงับสิทธิ์
                            </button>
                          )}

                          {agent.status === "SUSPENDED" && (
                            <button
                              disabled={busy}
                              onClick={() => handleStatusChange(agent.id, "ACTIVE")}
                              className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-all shadow-sm"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> คืนสิทธิ์
                            </button>
                          )}

                          <button
                            disabled={busy}
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md disabled:opacity-50 transition-all"
                            title="ลบตัวแทน"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
