import { prisma } from "@/lib/prisma";
import type { CallTelemetry } from "./run-verification";

const IAPP_IC_COST_THB = Number.parseFloat(process.env.IAPP_IC_COST_THB ?? "1.25");

function money(value: number): string {
  return value.toFixed(4);
}

export async function recordIappCost(args: {
  sessionId?: string;
  endpoint: string;
  ic: number;
  ms: number;
  httpStatus?: number;
}) {
  return prisma.wizardCostLog.create({
    data: {
      sessionId: args.sessionId,
      provider: "iapp",
      endpoint: args.endpoint,
      units: args.ic,
      unitType: "IC",
      unitCostThb: money(IAPP_IC_COST_THB),
      costThb: money(args.ic * IAPP_IC_COST_THB),
      durationMs: Math.round(args.ms),
      httpStatus: args.httpStatus,
    },
  });
}

export function iappTelemetryRecorder(sessionId: string) {
  return async (entry: CallTelemetry) => {
    await recordIappCost({
      sessionId,
      endpoint: entry.endpoint,
      ic: entry.ic,
      ms: entry.ms,
    });
  };
}

