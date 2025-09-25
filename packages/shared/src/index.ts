import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  firebaseUid: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const plaidItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  plaidItemId: z.string(),
  institutionName: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type PlaidItem = z.infer<typeof plaidItemSchema>;

const isoDatePattern = /\d{4}-\d{2}-\d{2}/;

export const transactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  accountId: z.string().uuid(),
  plaidTxnId: z.string(),
  postedAt: z
    .string()
    .regex(isoDatePattern, "Expected ISO date (YYYY-MM-DD)")
    .nullable(),
  amount: z.number().nullable(),
  currency: z.string().min(1),
  merchantName: z.string().nullable(),
  rawCategory: z.string().nullable(),
  aiCategory: z.string().nullable(),
  aiConfidence: z.number().min(0).max(1).nullable(),
  isRecurring: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const plaidLinkTokenResponse = z.object({
  linkToken: z.string(),
  expiration: z.string().datetime(),
});

export const publicTokenExchangeRequest = z.object({
  publicToken: z.string(),
  institutionName: z.string(),
});

export const transactionSyncPayload = z.object({
  added: z.array(transactionSchema).default([]),
  modified: z.array(transactionSchema).default([]),
  removed: z.array(z.object({ id: z.string().uuid() })).default([]),
  nextCursor: z.string().nullish(),
});

export type TransactionSyncPayload = z.infer<typeof transactionSyncPayload>;

export const plaidWebhookPayload = z.object({
  webhook_type: z.string(),
  webhook_code: z.string(),
  item_id: z.string().nullable().optional(),
  environment: z.string().optional(),
  new_transactions: z.number().optional(),
  error: z
    .object({
      error_code: z.string().optional(),
      error_message: z.string().optional(),
    })
    .optional(),
  webhook_id: z.string().optional(),
  webhook_timestamp: z.string().optional(),
  initial_update_complete: z.boolean().optional(),
});

export type PlaidWebhookPayload = z.infer<typeof plaidWebhookPayload>;

export const notificationPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: z.record(z.string()).optional(),
});

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
