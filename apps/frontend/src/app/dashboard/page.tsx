"use client";

import { Bell, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TransactionsCard from "@/components/transactions-card";
import { useAuth } from "@/providers/auth-provider";
import CsvUploadButton from "@/components/csv-upload-button";

export default function DashboardPage() {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Welcome back{user ? `, ${user.displayName ?? ""}` : ""}</p>
            <h1 className="text-3xl font-semibold text-white">Your financial snapshot</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500">
              <Bell className="h-4 w-4" /> Alerts
            </button>
            <CsvUploadButton />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">Net worth</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">$86,420</p>
            <p className="text-xs text-slate-500">Updated seconds ago</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">Monthly burn</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">$4,112</p>
            <p className="text-xs text-slate-500">Trending down 4.7%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">Budget health</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">72%</p>
            <p className="text-xs text-slate-500">AI suggests reviewing dining spend</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <TransactionsCard />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" /> AI insights
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Once you enable the FastAPI microservice, this panel streams weekly summaries and anomaly detection results
              backed by your transaction history.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>• Forecast next month&apos;s savings given current trends.</li>
              <li>• Flag recurring payments with rising amounts.</li>
              <li>• Auto-tag new merchants for faster budgeting.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
