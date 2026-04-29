"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Globe,
  CreditCard,
  ArrowUpRight,
  XCircle,
  Shield,
} from "lucide-react";

interface DemoOrder {
  orderId: string;
  status: string;
  amountTHB: number;
  transactionId: string | null;
  paymentStatus: string | null;
  paidAt: string | null;
  domain: string;
  channel: string;
  isDemoOrder: boolean;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  source: string;
  endpoint: string;
  clientIp: string;
  domain: string;
  signatureValid: boolean;
  processed: boolean;
  processingError: string | null;
  receivedAt: string;
  bodyPreview: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  PAID: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  PENDING_PAYMENT: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  SUPPLIER_PLACED: { bg: "bg-blue-50", text: "text-blue-700", icon: Zap },
  FAILED: { bg: "bg-red-50", text: "text-red-700", icon: XCircle },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", icon: XCircle },
};

function formatTHB(n: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(n);
}

function relativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "เมื่อกี้";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชม.ที่แล้ว`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} วันที่แล้ว`;
}

export default function DemoOrdersPage() {
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "webhooks">("orders");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showTestModal, setShowTestModal] = useState(false);
  const [testAmount, setTestAmount] = useState("500");
  const [testChannel, setTestChannel] = useState("PROMPTPAY");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, logsRes] = await Promise.all([
        fetch("/api/admin/demo-orders?limit=50"),
        fetch("/api/admin/webhook-logs?limit=50&source=ANYPAY"),
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders ?? []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs ?? []);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  async function handleTestWebhook() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhook/quickpay/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(testAmount) || 500,
          channel: testChannel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, msg: `✅ สร้าง Demo Order สำเร็จ — ${formatTHB(data.demoOrder?.amountTHB ?? parseFloat(testAmount))}` });
        fetchData();
      } else {
        setTestResult({ ok: false, msg: `❌ ${data.error ?? "ไม่สำเร็จ"}` });
      }
    } catch {
      setTestResult({ ok: false, msg: "❌ เชื่อมต่อไม่ได้" });
    }
    setTestLoading(false);
  }

  const totalAmount = orders.reduce((sum, o) => sum + o.amountTHB, 0);
  const paidCount = orders.filter((o) => o.status === "PAID").length;
  const validWebhooks = logs.filter((l) => l.signatureValid).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🧪 Demo Orders — QuickPay Verification
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            รายการ Demo Order ที่สร้างจาก QuickPay/AnyPay Deposit Webhook · สำหรับให้ทีม AnyPay ตรวจสอบ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowTestModal(true); setTestResult(null); }}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Zap className="h-4 w-4" />
            ทดสอบ Webhook
          </button>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (10s)
          </label>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Test Webhook Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTestModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-500" />
              ทดสอบ Deposit Webhook
            </h2>
            <p className="mt-1 text-sm text-gray-500">จำลองการฝากเงินเพื่อสร้าง Demo Order</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  min="1"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="500"
                />
                <div className="mt-2 flex gap-2">
                  {[100, 500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTestAmount(String(amt))}
                      className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                        testAmount === String(amt)
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ช่องทาง</label>
                <select
                  value={testChannel}
                  onChange={(e) => setTestChannel(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                >
                  <option value="PROMPTPAY">PromptPay</option>
                  <option value="BANK_TRANSFER">โอนธนาคาร</option>
                  <option value="CREDIT_CARD">บัตรเครดิต</option>
                  <option value="TRUEMONEY">TrueMoney Wallet</option>
                </select>
              </div>

              {testResult && (
                <div className={`rounded-lg p-3 text-sm ${testResult.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                  {testResult.msg}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTestModal(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                ปิด
              </button>
              <button
                onClick={handleTestWebhook}
                disabled={testLoading || !testAmount}
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {testLoading ? "กำลังทดสอบ..." : `ทดสอบฝาก ${formatTHB(parseFloat(testAmount) || 0)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Demo Orders"
          value={orders.length}
          icon={<CreditCard className="h-5 w-5 text-violet-500" />}
          accent="violet"
        />
        <StatCard
          label="ชำระแล้ว"
          value={paidCount}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          accent="emerald"
        />
        <StatCard
          label="ยอดรวม"
          value={formatTHB(totalAmount)}
          icon={<Zap className="h-5 w-5 text-amber-500" />}
          accent="amber"
        />
        <StatCard
          label="Webhook ถูกต้อง"
          value={`${validWebhooks}/${logs.length}`}
          icon={<Shield className="h-5 w-5 text-blue-500" />}
          accent="blue"
        />
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          <button
            onClick={() => setTab("orders")}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === "orders"
                ? "border-violet-500 text-violet-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Demo Orders ({orders.length})
          </button>
          <button
            onClick={() => setTab("webhooks")}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === "webhooks"
                ? "border-violet-500 text-violet-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Webhook Logs ({logs.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <EmptyState
              title="ยังไม่มี Demo Order"
              description="เมื่อได้รับ Deposit Webhook จาก QuickPay/AnyPay ระบบจะสร้าง Demo Order ให้อัตโนมัติ"
            />
          ) : (
            orders.map((order) => <OrderCard key={order.orderId} order={order} />)
          )}
        </div>
      )}

      {tab === "webhooks" && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <EmptyState
              title="ยังไม่มี Webhook Log"
              description="Webhook logs จะปรากฏเมื่อระบบได้รับ callback จาก QuickPay/AnyPay"
            />
          ) : (
            logs.map((log) => <WebhookCard key={log.id} log={log} />)
          )}
        </div>
      )}

      {/* Footer info */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">📋 สำหรับทีม AnyPay</p>
        <ul className="mt-2 ml-4 list-disc space-y-1 text-blue-700">
          <li>
            Webhook URL (QuickPay):{" "}
            <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs">
              https://basketplace.co/api/webhook/quickpay
            </code>
          </li>
          <li>
            Webhook URL (AnyPay):{" "}
            <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs">
              https://basketplace.co/api/webhook/anypay
            </code>
          </li>
          <li>Signature: HMAC-SHA256 ใน header <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs">x-quickpay-signature</code></li>
          <li>ระบบรองรับ idempotent — ส่ง webhook ซ้ำได้ไม่สร้าง order ซ้ำ</li>
        </ul>
        <p className="mt-2 text-xs text-blue-600">
          Last refresh: {lastRefresh.toLocaleString("th-TH")}
        </p>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: DemoOrder }) {
  const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING_PAYMENT;
  const StatusIcon = style.icon;

  return (
    <div className="group rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 rounded-lg p-2.5 ${style.bg}`}>
            <StatusIcon className={`h-5 w-5 ${style.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{formatTHB(order.amountTHB)}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Order: <code className="text-gray-700">{order.orderId}</code>
            </p>
            {order.transactionId && (
              <p className="text-xs text-gray-500">
                Txn: <code className="text-gray-700">{order.transactionId}</code>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-right text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>{order.domain}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            <span>{order.channel}</span>
          </div>
          <span title={new Date(order.createdAt).toLocaleString("th-TH")}>
            {relativeTime(order.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function WebhookCard({ log }: { log: WebhookLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-lg p-2 ${
              log.signatureValid
                ? log.processed
                  ? "bg-emerald-50"
                  : "bg-amber-50"
                : "bg-red-50"
            }`}
          >
            {log.signatureValid ? (
              log.processed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Clock className="h-4 w-4 text-amber-600" />
              )
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium">{log.endpoint}</code>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  log.signatureValid
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {log.signatureValid ? "✓ Valid" : "✗ Invalid"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              IP: {log.clientIp} · Domain: {log.domain}
            </p>
            {log.processingError && (
              <p className="mt-1 text-xs text-amber-600">⚠ {log.processingError}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{relativeTime(log.receivedAt)}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded border px-2 py-1 hover:bg-gray-50"
          >
            {expanded ? "Hide" : "Show"} Body
          </button>
        </div>
      </div>
      {expanded && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
          {log.bodyPreview}
        </pre>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg bg-${accent}-50 p-2`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-0.5 text-lg font-bold text-gray-900">{String(value)}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-gray-300" />
      <h3 className="mt-3 text-sm font-semibold text-gray-700">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}
