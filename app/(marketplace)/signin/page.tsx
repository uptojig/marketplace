"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6 text-center">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground">
        Configure GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in <code>.env.local</code> to enable Google sign-in.
        Without auth env vars, the storefront falls back to a guest user for checkout demos.
      </p>
      <Button onClick={() => signIn("google", { callbackUrl: "/" })}>Continue with Google</Button>
    </div>
  );
}
