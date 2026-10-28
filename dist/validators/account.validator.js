import { z } from "zod";
export const createAccountSchema = z.object({
    accountId: z.string().trim().min(1, "Account ID is required"),
    name: z.string().trim().min(1, "Account name is required"),
});
