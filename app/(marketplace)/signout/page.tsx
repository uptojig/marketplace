"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      window.location.href = "/signin";
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-mp-cream">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-mp-coral animate-spin mx-auto mb-3" />
        <p className="text-[15px] text-mp-ink-muted">กำลังออกจากระบบ...</p>
      </div>
    </div>
  );
}
