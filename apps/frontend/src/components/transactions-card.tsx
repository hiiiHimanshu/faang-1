"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { Transaction } from "@project/shared";

const EMPTY_TRANSACTIONS: Transaction[] = [];

type TransactionsResponse = {
  transactions: Transaction[];
};

export default function TransactionsCard() {
  const { status, idToken } = useAuth();

  const { data, isFetching } = useQuery<TransactionsResponse>({
    queryKey: ["transactions", idToken],
    queryFn: async () => {
      if (!idToken) {
        return { transactions: EMPTY_TRANSACTIONS };
      }

      try {
        const response = await apiFetch<TransactionsResponse>("/transactions?limit=5", "GET", undefined, {
          token: idToken,
        });
        return response;
      } catch (error) {
        console.warn("transactions fetch fallback", error);
        return {
          transactions: SAMPLE_TRANSACTIONS,
        };
      }
    },
    enabled: status === "authenticated" && Boolean(idToken),
    refetchOnWindowFocus: false,
  });

  const transactions = useMemo(() => data?.transactions ?? EMPTY_TRANSACTIONS, [data]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Latest activity</h2>
        <span className="text-xs text-slate-500">{isFetching ? "Refreshing..." : "Updated live"}</span>
      </div>

      <div className="mt-4 space-y-3">
        {transactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
            Upload a CSV or use the sample data to see insights.
          </p>
        ) : (
          transactions.map((transaction) => {
            const amount = transaction.amount ?? 0;
            const isDebit = amount < 0;
            const postedLabel = transaction.postedAt
              ? format(parseISO(`${transaction.postedAt}T00:00:00Z`), "MMM d, yyyy")
              : "Pending";

            return (
              <div
                key={transaction.id}
                className={`flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 ${
                  transaction.aiCategory === "Anomaly" ? "border-rose-500/80" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {transaction.merchantName ?? "Pending transaction"}
                  </p>
                  <p className="text-xs text-slate-500">{postedLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-300">
                    {isDebit ? "-" : ""}${Math.abs(amount).toFixed(2)} {transaction.currency}
                  </p>
                  <p className="text-xs text-slate-500">{transaction.aiCategory ?? "Uncategorized"}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    plaidTxnId: "sample-1",
    postedAt: "2024-09-30",
    amount: -42.75,
    currency: "USD",
    merchantName: "Blue Bottle Coffee",
    rawCategory: "Food and Drink",
    aiCategory: "Coffee Shops",
    aiConfidence: 0.9,
    isRecurring: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    plaidTxnId: "sample-2",
    postedAt: "2024-09-28",
    amount: -128.4,
    currency: "USD",
    merchantName: "Whole Foods",
    rawCategory: "Groceries",
    aiCategory: "Groceries",
    aiConfidence: 0.82,
    isRecurring: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    userId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    accountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    plaidTxnId: "sample-3",
    postedAt: "2024-09-25",
    amount: 2500,
    currency: "USD",
    merchantName: "Payroll",
    rawCategory: "Income",
    aiCategory: "Income",
    aiConfidence: 0.95,
    isRecurring: true,
    createdAt: new Date().toISOString(),
  },
];
