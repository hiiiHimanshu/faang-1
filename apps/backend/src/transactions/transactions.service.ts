import { Injectable } from '@nestjs/common';
import type { Transaction as SharedTransaction } from '@project/shared';
import { PrototypeDataService, type TransactionRecord } from '@/data/prototype-data.service';

interface ListOptions {
  firebaseUid: string | undefined;
  limit: number;
  from?: string;
  to?: string;
  category?: string;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly data: PrototypeDataService) {}

  async listRecentTransactions(
    options: ListOptions,
  ): Promise<SharedTransaction[]> {
    const { firebaseUid, limit, from, to, category } = options;
    if (!firebaseUid) {
      return [];
    }

    const user = this.data.getUser(firebaseUid);
    if (!user) {
      return [];
    }

    const anomalyIds = this.data.getAnomalyTransactionIds(firebaseUid);
    const currencyByAccount = new Map<string, string>();
    user.accounts.forEach((account) => {
      currencyByAccount.set(account.id, account.currency ?? 'INR');
    });

    const txns = this.data
      .listTransactions(firebaseUid, { from, to, category })
      .slice(0, limit);

    return txns.map((txn) =>
      this.toSharedTransaction(
        firebaseUid,
        txn,
        anomalyIds.has(txn.id),
        currencyByAccount.get(txn.accountId) ?? 'INR',
      ),
    );
  }

  private toSharedTransaction(
    firebaseUid: string,
    txn: TransactionRecord,
    isAnomaly: boolean,
    currency: string,
  ): SharedTransaction {
    const category = isAnomaly
      ? 'Anomaly'
      : txn.aiCategory ?? txn.category ?? 'Uncategorized';
    const aiConfidence = isAnomaly
      ? 0.99
      : txn.aiConfidence ?? 0.2;
    return {
      id: txn.id,
      userId: firebaseUid,
      accountId: txn.accountId,
      plaidTxnId: txn.id,
      postedAt: txn.postedAt,
      amount: txn.amount,
      currency,
      merchantName: txn.merchantName,
      rawCategory: txn.rawCategory ?? txn.category,
      aiCategory: category,
      aiConfidence,
      isRecurring: txn.isRecurring,
      createdAt: new Date(`${txn.postedAt}T00:00:00Z`).toISOString(),
    };
  }
}
