import type { Notifier } from "./types";

export const consoleNotifier: Notifier = {
  async info(event, payload) {
    console.log(`[notify:info] ${event}`, JSON.stringify(payload));
  },
  async error(event, payload) {
    console.error(`[notify:error] ${event}`, JSON.stringify(payload));
  },
};
