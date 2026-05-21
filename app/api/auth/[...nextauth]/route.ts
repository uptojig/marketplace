import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const authHandler = NextAuth(authOptions);

const handler = async (req: NextRequest, ctx: any) => {
  const host = req.headers.get("host");
  if (host && !host.includes("basketplace.co")) {
    const proto = req.headers.get("x-forwarded-proto") || "http";
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }
  return authHandler(req, ctx);
};

export { handler as GET, handler as POST };
