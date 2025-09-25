import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-24">
        <div className="space-y-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300 shadow-glow">
            Atlas Ledger
          </span>
          <h1 className="text-4xl font-semibold text-slate-100 sm:text-5xl">
            Command-center for your personal finances.
          </h1>
          <p className="max-w-2xl text-lg text-slate-400">
            Connect your bank accounts with Plaid, monitor spend in real-time, and let AI surface insights before
            they become problems.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              Get started
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-200 transition hover:border-slate-500"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Weekly burn</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">$1,240</p>
              <p className="text-xs text-slate-500">Down 8% vs last week</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Savings rate</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">22%</p>
              <p className="text-xs text-slate-500">Goal: 25% monthly</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Alerts</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">2</p>
              <p className="text-xs text-slate-500">Subscriptions to review</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Deploy on Vercel, connect Supabase, and drop in your Plaid keys to go live fast. Build a premium tier with
            Stripe or plug in a FastAPI microservice when you are ready for predictive analytics.
          </p>
        </div>
      </div>
    </main>
  );
}
