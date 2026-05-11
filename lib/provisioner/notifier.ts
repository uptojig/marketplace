// Admin notifier for provisioning lifecycle events. Currently just supports
// Discord + LINE Notify + console — adding more channels means one new fn here.

import { getConfig } from "./config";

export type AdminAlert = {
  level: "info" | "warning" | "error";
  title: string;
  body: string;
  fields?: Record<string, string>;
};

export async function notifyAdmin(alert: AdminAlert): Promise<void> {
  const cfg = getConfig();
  const channel = cfg.whitelistAlertChannel;
  const url = cfg.whitelistAlertWebhookUrl;

  if (channel === "console" || !url) {
    // eslint-disable-next-line no-console
    console.log(`[provisioner-alert] ${alert.level.toUpperCase()} ${alert.title}\n${alert.body}`, alert.fields ?? {});
    return;
  }

  try {
    if (channel === "discord") {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: alert.title,
              description: alert.body,
              color: alert.level === "error" ? 0xef4444 : alert.level === "warning" ? 0xf59e0b : 0x3b82f6,
              fields: Object.entries(alert.fields ?? {}).map(([name, value]) => ({
                name,
                value: String(value),
                inline: true,
              })),
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    } else if (channel === "line") {
      // LINE Notify uses a Bearer token + form body
      const message = `${alert.title}\n${alert.body}\n${Object.entries(alert.fields ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`;
      await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${url}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ message }).toString(),
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[provisioner-alert] delivery failed", err);
  }
}
