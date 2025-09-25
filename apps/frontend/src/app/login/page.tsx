"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, status, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-white">Sign in to Atlas Ledger</h1>
          <p className="text-sm text-slate-400">
            We use Firebase Auth to securely store your credentials and sync FCM notifications.
          </p>
        </div>
        <button
          onClick={() => signInWithGoogle()}
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" /> Continue with Google
        </button>
        <p className="text-center text-xs text-slate-500">
          By continuing you agree to our Terms and acknowledge our Privacy Policy.
        </p>
        {status === "authenticated" && user ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm text-emerald-300">
            Redirecting you to the dashboard...
          </p>
        ) : null}
      </div>
    </div>
  );
}
