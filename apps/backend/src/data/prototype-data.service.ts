import { Injectable } from '@nestjs/common';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { randomUUID } from 'node:crypto';

export type AccountRecord = {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  currency: string;
  balance: number;
};

export type TransactionRecord = {
  id: string;
  accountId: string;
  postedAt: string;
  amount: number;
  merchantName: string;
  category: string;
  isRecurring: boolean;
  description?: string | null;
  rawCategory?: string | null;
  aiCategory?: string | null;
  aiConfidence?: number | null;
};

export type AlertRecord = {
  id: string;
  kind: string;
  message: string;
  firedAt: string;
  read: boolean;
};

export type BudgetRuleRecord = {
  id: string;
  category: string;
  monthlyLimit: number;
};

export type PrototypeUser = {
  id: string;
  firebaseUid: string;
  email: string;
  accounts: AccountRecord[];
  transactions: TransactionRecord[];
  alerts: AlertRecord[];
  budgets: BudgetRuleRecord[];
};

const SEED_USER: PrototypeUser = {
  id: 'user-demo',
  firebaseUid: 'demo',
  email: 'demo@atlasledger.app',
  accounts: [
    {
      id: 'acct-checking',
      name: 'Everyday Checking',
      mask: '1234',
      type: 'depository',
      subtype: 'checking',
      currency: 'USD',
      balance: 4820.37,
    },
    {
      id: 'acct-credit',
      name: 'Rewards Credit Card',
      mask: '9001',
      type: 'credit',
      subtype: 'credit card',
      currency: 'USD',
      balance: -613.25,
    },
  ],
  transactions: [
    {
      id: 'txn-1',
      accountId: 'acct-checking',
      postedAt: '2024-11-02',
      amount: -42.76,
      merchantName: 'Blue Bottle Coffee',
      category: 'Coffee Shops',
      isRecurring: false,
    },
    {
      id: 'txn-2',
      accountId: 'acct-checking',
      postedAt: '2024-10-29',
      amount: -128.4,
      merchantName: 'Whole Foods Market',
      category: 'Groceries',
      isRecurring: true,
    },
    {
      id: 'txn-3',
      accountId: 'acct-credit',
      postedAt: '2024-10-27',
      amount: -64,
      merchantName: 'Peloton Membership',
      category: 'Fitness',
      isRecurring: true,
    },
    {
      id: 'txn-4',
      accountId: 'acct-checking',
      postedAt: '2024-10-25',
      amount: 2500,
      merchantName: 'Acme Corp Payroll',
      category: 'Income',
      isRecurring: true,
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      kind: 'overspend',
      message: 'Dining spend is 32% over budget this month.',
      firedAt: '2024-10-28T15:04:00Z',
      read: false,
    },
    {
      id: 'alert-2',
      kind: 'recurring-increase',
      message: 'Peloton Membership increased from $49 to $64.',
      firedAt: '2024-10-20T09:12:00Z',
      read: true,
    },
  ],
  budgets: [
    {
      id: 'budget-1',
      category: 'Groceries',
      monthlyLimit: 600,
    },
    {
      id: 'budget-2',
      category: 'Dining',
      monthlyLimit: 250,
    },
  ],
};

const MERCHANT_NORMALIZATION: Array<[RegExp, string]> = [
  [/^uber\s*\*?.*$/i, 'Uber'],
  [/^starbucks.*$/i, 'Starbucks'],
  [/^whole\s*foods?.*$/i, 'Whole Foods'],
  [/^amazon.*$/i, 'Amazon'],
  [/^blue\s*bottle\s*coffee.*$/i, 'Blue Bottle Coffee'],
  [/^peloton.*$/i, 'Peloton'],
  [/^acme\s*corp.*$/i, 'Acme Corp'],
];

const DICTIONARY_RULES: Array<{ patterns: string[]; category: string }> = [
  {
    patterns: ['swiggy', 'zomato', 'uber eats', 'ubereats'],
    category: 'Food & Dining',
  },
  {
    patterns: ['ola', 'uber', 'rapido'],
    category: 'Transport',
  },
  {
    patterns: ['amazon', 'flipkart', 'myntra', 'ajio'],
    category: 'Shopping',
  },
  {
    patterns: ['vi', 'jio', 'airtel', 'bsnl'],
    category: 'Utilities',
  },
  {
    patterns: ['bigbasket', 'blinkit', 'zepto', 'dmart'],
    category: 'Groceries',
  },
];

const REGEX_RULES: Array<{ regex: RegExp; category: string }> = [
  { regex: /(rent|maintenance)/i, category: 'Housing & Utilities' },
  { regex: /(fee|charges?)/i, category: 'Fees & Charges' },
  { regex: /(emi|loan)/i, category: 'Loans & EMI' },
  { regex: /interest/i, category: 'Interest & Charges' },
];

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function stripEmojis(value: string) {
  return value.replace(/\p{Extended_Pictographic}/gu, '');
}

function normalizeMerchant(name: string): string {
  const cleaned = stripEmojis(name)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\b(pos|upi|imps|ach|atm|ecs|neft|rtgs|qr|upi id|ref)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  for (const [pattern, normalized] of MERCHANT_NORMALIZATION) {
    if (pattern.test(cleaned)) {
      return normalized;
    }
  }

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseAmount(value?: string | null) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const cleaned = value.replace(/[$,]/g, '').trim();
  if (!cleaned) {
    return undefined;
  }
  const number = Number(cleaned);
  return Number.isNaN(number) ? undefined : number;
}

@Injectable()
export class PrototypeDataService {
  private readonly users = new Map<string, PrototypeUser>();
  private readonly userOverrides = new Map<string, Map<string, string>>();
  private readonly anomalyTransactionIds = new Map<string, Set<string>>();

  constructor() {
    const seed = deepClone(SEED_USER);
    seed.transactions = seed.transactions.map((txn) => ({
      ...txn,
      merchantName: normalizeMerchant(txn.merchantName),
    }));
    seed.transactions.forEach((txn) => this.applyCategorization(seed, txn));
    this.users.set(seed.firebaseUid, seed);
    this.userOverrides.set(seed.firebaseUid, new Map());
    this.recalculateAlerts(seed);
  }

  registerUser(firebaseUid: string, email: string) {
    const existing = this.users.get(firebaseUid);
    if (existing) {
      existing.email = email;
      return existing;
    }

    const template = deepClone(SEED_USER);
    const userId = randomUUID();
    template.id = userId;
    template.firebaseUid = firebaseUid;
    template.email = email;
    template.accounts = template.accounts.map((acct) => ({
      ...acct,
      id: `${acct.id}-${userId}`,
    }));
    template.transactions = template.transactions.map((txn) => ({
      ...txn,
      id: `${txn.id}-${userId}`,
      accountId: `${txn.accountId}-${userId}`,
      merchantName: normalizeMerchant(txn.merchantName),
    }));
    template.alerts = template.alerts.map((alert) => ({
      ...alert,
      id: `${alert.id}-${userId}`,
    }));
    template.budgets = template.budgets.map((budget) => ({
      ...budget,
      id: `${budget.id}-${userId}`,
    }));

    this.users.set(firebaseUid, template);
    this.userOverrides.set(firebaseUid, new Map());
    template.transactions.forEach((txn) => this.applyCategorization(template, txn));
    this.recalculateAlerts(template);
    return template;
  }

  getUser(firebaseUid: string): PrototypeUser | undefined {
    return this.users.get(firebaseUid);
  }

  listAccounts(firebaseUid: string) {
    return this.users.get(firebaseUid)?.accounts ?? [];
  }

  listTransactions(
    firebaseUid: string,
    options: { from?: string; to?: string; category?: string },
  ) {
    const user = this.users.get(firebaseUid);
    if (!user) {
      return [];
    }

    const { from, to, category } = options;
    return user.transactions.filter((txn) => {
      const date = parseISO(txn.postedAt);
      if (from && isBefore(date, parseISO(from))) {
        return false;
      }
      if (to && isAfter(date, parseISO(to))) {
        return false;
      }
      if (category && txn.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  rebuildCategories(firebaseUid: string) {
    const user = this.users.get(firebaseUid);
    if (!user) {
      return { updated: 0 };
    }

    let updated = 0;
    for (const txn of user.transactions) {
      const previous = txn.category;
      this.applyCategorization(user, txn);
      if (txn.category !== previous) {
        updated += 1;
      }
    }
    this.recalculateAlerts(user);
    return { updated };
  }

  getSummary(firebaseUid: string, period: 'week' | 'month', start: string) {
    const user = this.users.get(firebaseUid);
    if (!user) {
      return { totalSpend: 0, byCategory: [], start, end: start };
    }

    const windowStart = parseISO(start);
    const windowEnd =
      period === 'week' ? addDays(windowStart, 7) : addDays(windowStart, 30);

    const totals = new Map<string, number>();
    let totalSpend = 0;

    for (const txn of user.transactions) {
      const date = parseISO(txn.postedAt);
      if (isBefore(date, windowStart) || isAfter(date, windowEnd)) {
        continue;
      }
      if (txn.amount < 0) {
        totalSpend += Math.abs(txn.amount);
        totals.set(
          txn.category,
          (totals.get(txn.category) ?? 0) + Math.abs(txn.amount),
        );
      }
    }

    return {
      totalSpend,
      start,
      end: windowEnd.toISOString().slice(0, 10),
      byCategory: Array.from(totals.entries()).map(([category, amount]) => ({
        category,
        amount,
      })),
    };
  }

  getForecast(firebaseUid: string) {
    const user = this.users.get(firebaseUid);
    const baseline = user
      ? user.transactions.reduce((sum, txn) => {
          return txn.amount < 0 ? sum + Math.abs(txn.amount) : sum;
        }, 0) / Math.max(user.transactions.length, 1)
      : 0;

    return {
      next30DaySpend: Number((baseline * 15).toFixed(2)),
      confidence: 0.68,
      methodology: 'Simple moving average of historical daily spend.',
    };
  }

  listAlerts(firebaseUid: string) {
    return this.users.get(firebaseUid)?.alerts ?? [];
  }

  upsertBudget(
    firebaseUid: string,
    rule: { category: string; monthlyLimit: number },
  ) {
    const user = this.users.get(firebaseUid);
    if (!user) {
      throw new Error('User not found');
    }

    const existing = user.budgets.find(
      (budget) => budget.category.toLowerCase() === rule.category.toLowerCase(),
    );

    if (existing) {
      existing.monthlyLimit = rule.monthlyLimit;
      this.recalculateAlerts(user);
      return existing;
    }

    const newRule: BudgetRuleRecord = {
      id: randomUUID(),
      category: rule.category,
      monthlyLimit: rule.monthlyLimit,
    };
    user.budgets.push(newRule);
    this.recalculateAlerts(user);
    return newRule;
  }

  uploadTransactions(firebaseUid: string, rows: Array<Record<string, string>>) {
    const user = this.users.get(firebaseUid);
    if (!user) {
      throw new Error('User not found');
    }

    for (const row of rows) {
      const accountId = row.accountId ?? user.accounts[0]?.id;
      if (!accountId) {
        continue;
      }

      const merchantName = row.merchantName ?? row.description ?? 'Unknown';
      const normalizedMerchant = normalizeMerchant(merchantName);
      const debit = parseAmount(row.debit);
      const credit = parseAmount(row.credit);
      const rawAmount = parseAmount(row.amount);
      const signedAmount =
        rawAmount !== undefined
          ? rawAmount
          : debit !== undefined
          ? -Math.abs(debit)
          : credit !== undefined
          ? Math.abs(credit)
          : 0;
      const postedAt =
        row.postedAt ?? row.date ?? new Date().toISOString().slice(0, 10);

      const rawCategory = row.category ? row.category.trim() || null : null;
      const description = row.description ?? row.memo ?? null;

      const record: TransactionRecord = {
        id: randomUUID(),
        accountId,
        postedAt,
        amount: signedAmount,
        merchantName: normalizedMerchant,
        category: rawCategory ?? 'Uncategorized',
        rawCategory,
        description,
        isRecurring: false,
        aiCategory: null,
        aiConfidence: null,
      };

      user.transactions.unshift(record);
      this.applyCategorization(user, record);
    }

    this.recalculateAlerts(user);
    return { imported: rows.length };
  }

  getAnomalyTransactionIds(firebaseUid: string) {
    return this.anomalyTransactionIds.get(firebaseUid) ?? new Set<string>();
  }

  private applyCategorization(user: PrototypeUser, txn: TransactionRecord) {
    const { category, confidence } = this.categorizeTransaction(user, txn);
    const previousRaw = txn.rawCategory ?? txn.category ?? null;
    txn.rawCategory = previousRaw;
    txn.aiCategory = category;
    txn.aiConfidence = Number(confidence.toFixed(2));
    txn.category = category;
  }

  private categorizeTransaction(
    user: PrototypeUser,
    txn: TransactionRecord,
  ): { category: string; confidence: number } {
    const merchantKey = txn.merchantName.toLowerCase();
    const overrides = this.userOverrides.get(user.firebaseUid);
    const overrideCategory = overrides?.get(merchantKey);
    if (overrideCategory) {
      return { category: overrideCategory, confidence: 1 };
    }

    for (const rule of DICTIONARY_RULES) {
      if (rule.patterns.some((pattern) => merchantKey.includes(pattern))) {
        return { category: rule.category, confidence: 0.9 };
      }
    }

    const searchable = `${txn.merchantName ?? ''} ${txn.description ?? ''}`;
    for (const { regex, category } of REGEX_RULES) {
      if (regex.test(searchable)) {
        return { category, confidence: 0.7 };
      }
    }

    if (this.isLikelyRecurring(user, txn)) {
      return { category: 'Bills & Subscriptions', confidence: 0.6 };
    }

    const fallback = txn.rawCategory ?? txn.category ?? 'Uncategorized';
    return { category: fallback || 'Uncategorized', confidence: 0.2 };
  }

  private isLikelyRecurring(user: PrototypeUser, txn: TransactionRecord) {
    if (!txn.postedAt) {
      return false;
    }
    const amount = Math.abs(txn.amount ?? 0);
    if (amount === 0) {
      return false;
    }

    const targetDate = parseISO(txn.postedAt);
    if (Number.isNaN(targetDate.getTime())) {
      return false;
    }

    const tolerance = Math.max(1, amount * 0.02);
    let matches = 0;
    for (const other of user.transactions) {
      if (other.id === txn.id || other.accountId !== txn.accountId) {
        continue;
      }
      const otherAmount = Math.abs(other.amount ?? 0);
      if (Math.abs(otherAmount - amount) > tolerance) {
        continue;
      }
      const otherDate = parseISO(other.postedAt);
      if (Number.isNaN(otherDate.getTime())) {
        continue;
      }
      const daysApart = Math.abs(
        (targetDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysApart >= 25 && daysApart <= 35) {
        matches += 1;
      }
    }

    if (matches >= 2) {
      return true;
    }

    return matches >= 1 && amount % 100 === 0;
  }

  private recalculateAlerts(user: PrototypeUser) {
    const alerts: AlertRecord[] = [];
    const anomalyIds = new Set<string>();

    for (const budget of user.budgets) {
      const spend = user.transactions
        .filter(
          (txn) => txn.category.toLowerCase() === budget.category.toLowerCase(),
        )
        .reduce(
          (sum, txn) => (txn.amount < 0 ? sum + Math.abs(txn.amount) : sum),
          0,
        );

      if (spend > budget.monthlyLimit) {
        alerts.push({
          id: randomUUID(),
          kind: 'overspend',
          message: `${budget.category} spend is ${Math.round(((spend - budget.monthlyLimit) / budget.monthlyLimit) * 100)}% over budget.`,
          firedAt: new Date().toISOString(),
          read: false,
        });
      }
    }

    const grouped = new Map<string, { amounts: number[] }>();
    for (const txn of user.transactions) {
      if (txn.amount < 0) {
        const key = `${txn.merchantName.toLowerCase()}|${txn.category.toLowerCase()}`;
        if (!grouped.has(key)) {
          grouped.set(key, { amounts: [] });
        }
        grouped.get(key)!.amounts.push(Math.abs(txn.amount));
      }
    }

    for (const [key, { amounts }] of grouped.entries()) {
      if (amounts.length < 5) continue;
      const mean =
        amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
      const variance =
        amounts.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        amounts.length;
      const stddev = Math.sqrt(variance);
      const latest = amounts[0];
      if (stddev > 0 && (latest - mean) / stddev > 3) {
        const [merchant, category] = key.split('|');
        const flaggedTxn = user.transactions.find(
          (txn) =>
            txn.merchantName.toLowerCase() === merchant &&
            txn.category.toLowerCase() === category,
        );
        alerts.push({
          id: randomUUID(),
          kind: 'anomaly',
          message: `Possible unusual spend at ${merchant} in ${category}.`,
          firedAt: new Date().toISOString(),
          read: false,
        });
        if (flaggedTxn) {
          anomalyIds.add(flaggedTxn.id);
        }
      }
    }

    user.alerts = alerts;
    this.anomalyTransactionIds.set(user.firebaseUid, anomalyIds);
  }
}
