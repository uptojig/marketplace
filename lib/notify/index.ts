import { consoleNotifier } from "./console";
import type { Notifier } from "./types";

export function getNotifier(): Notifier {
  // Future: switch on process.env.NOTIFIER_DRIVER -> line/email/discord
  return consoleNotifier;
}

export type { Notifier };
