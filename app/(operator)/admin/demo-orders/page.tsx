"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  CreditCard,
  XCircle,
  Shield,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OperatorPageHeader,
  OperatorCard,
  OperatorStatCard,
  OperatorStatusBadge,
  OperatorFilterChips,
  OperatorCallout,
  OperatorEmptyState,
  Button,
  Input,
  OperatorField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  orderStatusTone,
} from "@/components/operator/operator-primitives";

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

const STATUS_ICON: Record<string, LucideIcon> = {
  PAID: CheckCircle2,
  PENDING_PAYMENT: Clock,
  SUPPLIER_PLACED: Zap,
  FAILED: XCircle,
  CANCELLED: XCircle,
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
  const [testDomain, setTestDomain] = useState("ready-pay.co");
  const [storeDomains, setStoreDomains] = useState<string[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, logsRes, storesRes] = await Promise.all([
        fetch("/api/admin/demo-orders?limit=50"),
        fetch("/api/admin/webhook-logs?limit=50&source=ANYPAY"),
        fetch("/api/admin/stores"),
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders ?? []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs ?? []);
      }
      if (storesRes.ok) {
        const data = await storesRes.json();
        const domains = (data.stores ?? data ?? [])
          .map((s: { customDomain?: string | null }) => s.customDomain)
          .filter(Boolean) as string[];
        if (domains.length > 0) {
          setStoreDomains(domains);
          setTestDomain((prev) => (domains.includes(prev) ? prev : domains[0]));
        }
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
          domain: testDomain,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({
          ok: true,
          msg: `✅ สร้าง Demo Order สำเร็จ — ${formatTHB(data.demoOrder?.amountTHB ?? parseFloat(testAmount))}`,
        });
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
      <OperatorPageHeader
        title="🧪 Demo Orders — QuickPay Verification"
        description="รายการ Demo Order ที่สร้างจาก QuickPay/AnyPay Deposit Webhook · สำหรับให้ทีม AnyPay ตรวจสอบ"
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={() => { setShowTestModal(true); setTestResult(null); }}>
              <Zap />
              ทดสอบ Webhook
            </Button>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded accent-[color:var(--primary)]"
              />
              Auto-refresh (10s)
            </label>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Test Webhook Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                ทดสอบ Deposit Webhook
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">จำลองการฝากเงินเพื่อสร้าง Demo Order</p>

          <div className="space-y-4">
            <OperatorField label="จำนวนเงิน (บาท)">
              <Input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                min="1"
                placeholder="500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[100, 500, 1000, 2500, 5000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    size="sm"
                    variant={testAmount === String(amt) ? "default" : "outline"}
                    onClick={() => setTestAmount(String(amt))}
                  >
                    ฿{amt.toLocaleString()}
                  </Button>
                ))}
              </div>
            </OperatorField>

            <OperatorField label="ช่องทาง">
              <Select value={testChannel} onValueChange={setTestChannel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMPTPAY">PromptPay</SelectItem>
                  <SelectItem value="BANK_TRANSFER">โอนธนาคาร</SelectItem>
                  <SelectItem value="CREDIT_CARD">บัตรเครดิต</SelectItem>
                  <SelectItem value="TRUEMONEY">TrueMoney Wallet</SelectItem>
                </SelectContent>
              </Select>
            </OperatorField>

            <OperatorField label="ร้านค้า (โดเมน)">
              <Select value={testDomain} onValueChange={setTestDomain}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {storeDomains.length > 0 ? (
                    storeDomains.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="basketplace.co">basketplace.co</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </OperatorField>

            {testResult && (
              <OperatorCallout tone={testResult.ok ? "success" : "danger"}>
                {testResult.msg}
              </OperatorCallout>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestModal(false)}>
              ปิด
            </Button>
            <Button onClick={handleTestWebhook} disabled={testLoading || !testAmount}>
              {testLoading ? "กำลังทดสอบ..." : `ทดสอบฝาก ${formatTHB(parseFloat(testAmount) || 0)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <OperatorStatCard label="Demo Orders" value={orders.length} icon={CreditCard} tone="processing" />
        <OperatorStatCard label="ชำระแล้ว" value={paidCount} icon={CheckCircle2} tone="success" />
        <OperatorStatCard label="ยอดรวม" value={formatTHB(totalAmount)} icon={Zap} tone="warning" />
        <OperatorStatCard
          label="Webhook ถูกต้อง"
          value={`${validWebhooks}/${logs.length}`}
          icon={Shield}
          tone="info"
        />
      </div>

      {/* Tabs */}
      <OperatorFilterChips
        items={[
          { label: `Demo Orders (${orders.length})`, active: tab === "orders", onClick: () => setTab("orders") },
          { label: `Webhook Logs (${logs.length})`, active: tab === "webhooks", onClick: () => setTab("webhooks") },
        ]}
      />

      {/* Content */}
      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <OperatorCard contentClassName="p-0">
              <OperatorEmptyState
                title="ยังไม่มี Demo Order"
                description="เมื่อได้รับ Deposit Webhook จาก QuickPay/AnyPay ระบบจะสร้าง Demo Order ให้อัตโนมัติ"
              />
            </OperatorCard>
          ) : (
            orders.map((order) => <OrderCard key={order.orderId} order={order} />)
          )}
        </div>
      )}

      {tab === "webhooks" && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <OperatorCard contentClassName="p-0">
              <OperatorEmptyState
                title="ยังไม่มี Webhook Log"
                description="Webhook logs จะปรากฏเมื่อระบบได้รับ callback จาก QuickPay/AnyPay"
              />
            </OperatorCard>
          ) : (
            logs.map((log) => <WebhookCard key={log.id} log={log} />)
          )}
        </div>
      )}

      {/* Footer info */}
      <OperatorCallout tone="info">
        <p className="font-medium">📋 สำหรับทีม AnyPay</p>
        <ul className="ml-4 mt-2 list-disc space-y-1">
          <li>
            Webhook URL (QuickPay):{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-xs">
              https://basketplace.co/api/webhook/quickpay
            </code>
          </li>
          <li>
            Webhook URL (AnyPay):{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-xs">
              https://basketplace.co/api/webhook/anypay
            </code>
          </li>
          <li>
            Signature: HMAC-SHA256 ใน header{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-xs">x-quickpay-signature</code>
          </li>
          <li>ระบบรองรับ idempotent — ส่ง webhook ซ้ำได้ไม่สร้าง order ซ้ำ</li>
        </ul>
        <p className="mt-2 text-xs opacity-70">Last refresh: {lastRefresh.toLocaleString("th-TH")}</p>
      </OperatorCallout>
    </div>
  );
}

function OrderCard({ order }: { order: DemoOrder }) {
  const StatusIcon = STATUS_ICON[order.status] ?? Clock;
  const tone = orderStatusTone[order.status] ?? "neutral";

  return (
    <OperatorCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <StatusIcon className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{formatTHB(order.amountTHB)}</p>
              <OperatorStatusBadge tone={tone}>{order.status}</OperatorStatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Order: <code className="text-foreground">{order.orderId}</code>
            </p>
            {order.transactionId && (
              <p className="text-xs text-muted-foreground">
                Txn: <code className="text-foreground">{order.transactionId}</code>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-right text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Globe className="size-3.5" />
            <span>{order.domain}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="size-3.5" />
            <span>{order.channel}</span>
          </div>
          <span title={new Date(order.createdAt).toLocaleString("th-TH")}>
            {relativeTime(order.createdAt)}
          </span>
        </div>
      </div>
    </OperatorCard>
  );
}

function WebhookCard({ log }: { log: WebhookLog }) {
  const [expanded, setExpanded] = useState(false);
  const tone = log.signatureValid ? (log.processed ? "success" : "warning") : "danger";
  const StatusIcon = log.signatureValid ? (log.processed ? CheckCircle2 : Clock) : XCircle;

  return (
    <OperatorCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <StatusIcon className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium">{log.endpoint}</code>
              <OperatorStatusBadge tone={log.signatureValid ? "success" : "danger"}>
                {log.signatureValid ? "✓ Valid" : "✗ Invalid"}
              </OperatorStatusBadge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              IP: {log.clientIp} · Domain: {log.domain}
            </p>
            {log.processingError && (
              <p className="mt-1 text-xs text-destructive">⚠ {log.processingError}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{relativeTime(log.receivedAt)}</span>
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Hide" : "Show"} Body
          </Button>
        </div>
      </div>
      {expanded && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          {log.bodyPreview}
        </pre>
      )}
    </OperatorCard>
  );
}
