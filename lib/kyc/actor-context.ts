import { AsyncLocalStorage } from "node:async_hooks";

export type KycEvidenceSource = "vendor_upload" | "agent_upload" | "system_generated";

interface KycActorContext {
  actor: string;
  evidenceSource?: KycEvidenceSource;
}

const storage = new AsyncLocalStorage<KycActorContext>();

export function runWithKycActor<T>(
  context: KycActorContext,
  callback: () => T | Promise<T>,
): T | Promise<T> {
  return storage.run(context, callback);
}

export function resolveKycActor(fallback: string): string {
  return storage.getStore()?.actor ?? fallback;
}

export function resolveKycEvidenceSource(
  fallback: KycEvidenceSource = "vendor_upload",
): KycEvidenceSource {
  return storage.getStore()?.evidenceSource ?? fallback;
}
