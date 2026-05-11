// Admin notifier for provisioning lifecycle events.
//
// Reads the existing platform-wide notifier envs (NOTIFIER_DRIVER,
// DISCORD_WEBHOOK_URL, LINE_NOTIFY_TOKEN) rather than introducing its own —
// the provisioner just gets a richer payload shape than the generic
// lib/notify info/error pair.

export type AdminAlert = {
  level: "info" | "warning" | "error";
  title: string;
  body: string;
  fields?: Record<string, string>;
};

export async function notifyAdmin(alert: AdminAlert): Promise<void> {
  const driver = (process.env.NOTIFIER_DRIVER ?? "console").toLowerCase();
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const lineToken = process.env.LINE_NOTIFY_TOKEN;

  if (driver === "console" || (driver === "discord" && !discordUrl) || (driver === "line" && !lineToken)) {
    // eslint-disable-next-line no-console
    console.log(`[provisioner-alert] ${alert.level.toUpperCase()} ${alert.title}\n${alert.body}`, alert.fields ?? {});
    return;
  }

  try {
    if (driver === "discord" && discordUrl) {
      await fetch(discordUrl, {
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
    } else if (driver === "line" && lineToken) {
      // LINE Notify uses a Bearer token + form body
      const message = `${alert.title}\n${alert.body}\n${Object.entries(alert.fields ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`;
      await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lineToken}`,
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
