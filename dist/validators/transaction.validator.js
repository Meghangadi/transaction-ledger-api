import { z } from "zod";
export const createTransactionSchema = z.object({
    referenceId: z.string().trim().min(1, "Reference ID is required"),
    type: z.enum(["credit", "debit"]),
    amount: z.number().finite().positive("Amount must be positive"),
    description: z.string().trim().max(500).default(""),
});
export const transactionHistoryQuerySchema = z.object({
    type: z.enum(["credit", "debit"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});
