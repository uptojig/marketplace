import * as React from "react";
import {
  AlertTriangle,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "processing";

/**
 * Status colours live ONLY here. Pages must never hardcode bg-emerald /
 * bg-violet / bg-blue / etc. — the check-operator-ui guardrail bans those
 * hues in routes and allowlists this file, so visual parity with the old
 * per-page badges (Orders' blue/purple/yellow) is preserved without letting
 * ad-hoc colour drift back in. `processing` (violet) keeps SHIPPED visually
 * distinct from `info` (sky) the way the original Orders page did.
 */
const statusToneClasses: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  processing: "border-violet-200 bg-violet-50 text-violet-700",
};

/**
 * OrderStatus → tone. Covers the real Prisma enum (prisma/schema.prisma):
 * PENDING_PAYMENT=amber, PAID/DELIVERED=emerald, SUPPLIER_PLACED=sky,
 * SHIPPED=violet, CANCELLED=neutral, FAILED=red, RETURNED=amber (needs
 * refund handling). The legacy STATUS_BADGE map keyed "PENDING" which never
 * matched the enum, so those badges silently fell back to neutral. Keyed
 * loosely by string so callers can pass the enum value without importing it.
 */
export const orderStatusTone: Record<string, StatusTone> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  SUPPLIER_PLACED: "info",
  SHIPPED: "processing",
  DELIVERED: "success",
  CANCELLED: "neutral",
  FAILED: "danger",
  RETURNED: "warning",
};

/** AgentStatus → tone (Prisma AgentStatus: ACTIVE / PENDING_APPROVAL / SUSPENDED). */
export const agentStatusTone: Record<string, StatusTone> = {
  ACTIVE: "success",
  PENDING_APPROVAL: "warning",
  SUSPENDED: "danger",
};

/** ShopDeploymentStatus → tone (multi-tenant provisioning lifecycle). */
export const deploymentStatusTone: Record<string, StatusTone> = {
  PENDING: "neutral",
  CREATING_DROPLET: "info",
  CONFIGURING_DNS: "info",
  DEPLOYING_APP: "info",
  READY_FOR_WHITELIST: "warning",
  WHITELIST_REQUESTED: "warning",
  ACTIVE: "success",
  SUSPENDED: "neutral",
  FAILED: "danger",
  ARCHIVED: "neutral",
};

/** PaymentWhitelistStatus → tone. */
export const whitelistStatusTone: Record<string, StatusTone> = {
  NOT_REQUESTED: "neutral",
  REQUESTED: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
};

/** KYC WizardSession.state → tone (terminal + review states; others = neutral "in progress"). */
export const kycStateTone: Record<string, StatusTone> = {
  MANUAL_REVIEW: "warning",
  AUTO_APPROVED: "success",
  REJECTED: "danger",
};

/** ProvisioningJobStatus → tone. */
export const jobStatusTone: Record<string, StatusTone> = {
  QUEUED: "neutral",
  RUNNING: "info",
  SUCCEEDED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};

export function OperatorPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function OperatorCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={className}>
      {(title || description || actions) ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
          {actions ? <CardAction>{actions}</CardAction> : null}
        </CardHeader>
      ) : null}
      {children ? (
        <CardContent className={contentClassName}>{children}</CardContent>
      ) : null}
    </Card>
  );
}

export function OperatorStatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: StatusTone;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        {Icon ? (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg border", statusToneClasses[tone])}>
            <Icon />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function OperatorTable({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <OperatorCard
      title={title}
      description={description}
      actions={actions}
      className={className}
      contentClassName="p-0"
    >
      {/* Uniform table density + Orders-style tinted/uppercase header so every
          operator table reads the same without per-cell className spam. */}
      <div className="[&_thead_tr]:bg-muted/50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_td]:px-4 [&_td]:py-3">
        {children}
      </div>
    </OperatorCard>
  );
}

export function OperatorEmptyState({
  icon: Icon = AlertTriangle,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon />
      </div>
      <div className="max-w-md">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export function OperatorStatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(statusToneClasses[tone], className)}>
      {children}
    </Badge>
  );
}

export function OperatorLoading({
  label = "กำลังโหลดข้อมูล...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function OperatorError({
  title = "ไม่สามารถโหลดข้อมูลได้",
  description,
  action,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <OperatorCard className="w-full max-w-md" contentClassName="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="text-destructive" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? action : null}
      </OperatorCard>
    </div>
  );
}

export function OperatorFilterChips({
  items,
  className,
}: {
  items: Array<{
    label: React.ReactNode;
    /** Link-style chip (filter via URL). */
    href?: string;
    /** Button-style chip (filter via client state). */
    onClick?: () => void;
    active?: boolean;
  }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2 text-xs font-semibold", className)}>
      {items.map((item, i) => {
        const chipClass = cn(
          "rounded-full border px-3 py-1.5 transition",
          item.active
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-card text-foreground hover:bg-muted",
        );
        return item.href ? (
          <a
            key={i}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={chipClass}
          >
            {item.label}
          </a>
        ) : (
          <button
            key={i}
            type="button"
            onClick={item.onClick}
            aria-pressed={item.active}
            className={chipClass}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function OperatorToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function OperatorDescriptionList({
  items,
  className,
}: {
  items: Array<{ term: React.ReactNode; description: React.ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
          <dt className="w-full shrink-0 text-sm font-medium text-muted-foreground sm:w-48">
            {item.term}
          </dt>
          <dd className="min-w-0 flex-1 text-sm text-foreground">
            {item.description}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function OperatorCallout({
  tone = "neutral",
  title,
  icon: Icon,
  children,
  className,
}: {
  tone?: StatusTone;
  title?: React.ReactNode;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-3 text-sm", statusToneClasses[tone], className)}>
      {(title || Icon) ? (
        <div className="mb-1 flex items-center gap-2 font-semibold">
          {Icon ? <Icon className="size-4 shrink-0" /> : null}
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function OperatorDangerZone({
  title = "พื้นที่อันตราย",
  description,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-destructive">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function OperatorField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  // Form controls — re-exported so operator pages import controls from the
  // primitives barrel instead of reaching into components/ui ad-hoc.
  Input,
  Textarea,
  Label,
  Checkbox,
  Switch,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
