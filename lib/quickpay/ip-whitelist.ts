/**
 * QuickPay / AnyPay IP Whitelist — Application-level verification
 *
 * This is a defense-in-depth layer. Nginx already enforces IP whitelisting,
 * but we double-check at the application level for safety.
 */

// QuickPay production IP ranges (CIDR)
const QUICKPAY_IP_RANGES = [
  // QuickPay Production
  "103.253.132.0/24",
  "103.253.133.0/24",
  // AnyPay Production
  "202.183.197.0/24",
  "202.183.198.0/24",
  // QuickPay Staging
  "54.169.0.0/16",
];

// Dev/test: allow local IPs
const DEV_IPS = [
  "127.0.0.1",
  "::1",
  "localhost",
  "172.16.0.0/12",
  "10.0.0.0/8",
  "192.168.0.0/16",
];

function ipToLong(ip: string): number {
  const parts = ip.split(".");
  if (parts.length !== 4) return -1;
  return parts.reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIpInCIDR(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  const ipLong = ipToLong(ip);
  const rangeLong = ipToLong(range);
  if (ipLong === -1 || rangeLong === -1) return false;
  return (ipLong & mask) === (rangeLong & mask);
}

/**
 * Check if an IP address is in the QuickPay/AnyPay whitelist.
 * In development mode, local IPs are also allowed.
 */
export function isWhitelistedIP(ip: string): boolean {
  if (!ip) return false;

  // Strip IPv6 prefix if present
  const cleanIp = ip.startsWith("::ffff:") ? ip.slice(7) : ip;

  // Check production ranges
  for (const cidr of QUICKPAY_IP_RANGES) {
    if (cidr.includes("/")) {
      if (isIpInCIDR(cleanIp, cidr)) return true;
    } else {
      if (cleanIp === cidr) return true;
    }
  }

  // In development, allow local IPs
  if (process.env.NODE_ENV !== "production") {
    for (const devIp of DEV_IPS) {
      if (devIp.includes("/")) {
        if (isIpInCIDR(cleanIp, devIp)) return true;
      } else {
        if (cleanIp === devIp) return true;
      }
    }
  }

  // Allow explicitly configured IPs via env
  const extraIPs = process.env.QUICKPAY_EXTRA_WHITELIST_IPS;
  if (extraIPs) {
    const extras = extraIPs.split(",").map((s) => s.trim());
    for (const extra of extras) {
      if (extra.includes("/")) {
        if (isIpInCIDR(cleanIp, extra)) return true;
      } else {
        if (cleanIp === extra) return true;
      }
    }
  }

  return false;
}

/**
 * Get client IP from request headers (respecting proxy headers).
 */
export function getClientIP(req: Request): string {
  // X-Real-IP set by Nginx
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  // X-Forwarded-For (first entry is the actual client)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}
