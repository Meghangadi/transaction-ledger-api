import { createTransaction, getTransactionHistory, } from "../services/transaction.service.js";
import { createTransactionSchema, transactionHistoryQuerySchema, } from "../validators/transaction.validator.js";
import { z } from "zod";
export async function createTransactionController(req, res, next) {
    try {
        const accountId = z.string().parse(req.params.accountId);
        const input = createTransactionSchema.parse(req.body);
        const transaction = await createTransaction({
            accountId,
            ...input,
        });
        res.status(201).json({
            message: "Transaction created successfully",
            data: transaction,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getTransactionHistoryController(req, res, next) {
    try {
        const accountId = z.string().parse(req.params.accountId);
        const options = transactionHistoryQuerySchema.parse(req.query);
        const history = await getTransactionHistory(accountId, options);
        res.status(200).json({
            message: "Transaction history retrieved successfully",
            data: history,
        });
    }
    catch (error) {
        next(error);
    }
}
