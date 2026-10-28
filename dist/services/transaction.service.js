import mongoose from "mongoose";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
function serviceError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
}
export async function createTransaction(input) {
    const hello = await mongoose.connection.db?.admin().command({ hello: 1 });
    if (!hello?.setName) {
        const account = await Account.findOne({ accountId: input.accountId });
        if (!account) {
            throw serviceError("Account not found", 404);
        }
        if (input.type === "debit" && account.balance < input.amount) {
            throw serviceError("Insufficient balance", 400);
        }
        let createdTransaction;
        try {
            [createdTransaction] = await Transaction.create([
                {
                    accountId: input.accountId,
                    referenceId: input.referenceId,
                    type: input.type,
                    amount: input.amount,
                    description: input.description,
                },
            ]);
            const change = input.type === "credit" ? input.amount : -input.amount;
            const updatedAccount = await Account.findOneAndUpdate({
                accountId: input.accountId,
                ...(input.type === "debit"
                    ? { balance: { $gte: input.amount } }
                    : {}),
            }, { $inc: { balance: change } }, { new: true, runValidators: true });
            if (!updatedAccount) {
                await Transaction.deleteOne({ _id: createdTransaction._id });
                throw serviceError("Insufficient balance or concurrent account update", 409);
            }
            return createdTransaction;
        }
        catch (err) {
            if (err?.code === 11000) {
                throw serviceError("Reference ID already exists for this account", 409);
            }
            throw err;
        }
    }
    const session = await mongoose.startSession();
    try {
        let createdTransaction;
        await session.withTransaction(async () => {
            const account = await Account.findOne({
                accountId: input.accountId,
            }).session(session);
            if (!account) {
                throw serviceError("Account not found", 404);
            }
            const duplicate = await Transaction.findOne({
                accountId: input.accountId,
                referenceId: input.referenceId,
            }).session(session);
            if (duplicate) {
                throw serviceError("Reference ID already exists for this account", 409);
            }
            if (input.type === "debit" && account.balance < input.amount) {
                throw serviceError("Insufficient balance", 400);
            }
            const change = input.type === "credit" ? input.amount : -input.amount;
            const updatedAccount = await Account.findOneAndUpdate({
                accountId: input.accountId,
                ...(input.type === "debit"
                    ? { balance: { $gte: input.amount } }
                    : {}),
            }, { $inc: { balance: change } }, { new: true, session, runValidators: true });
            if (!updatedAccount) {
                throw serviceError("Insufficient balance or concurrent account update", 409);
            }
            const [transaction] = await Transaction.create([{
                    accountId: input.accountId,
                    referenceId: input.referenceId,
                    type: input.type,
                    amount: input.amount,
                    description: input.description,
                }], { session });
            createdTransaction = transaction;
        });
        return createdTransaction;
    }
    catch (err) {
        if (err?.code === 11000) {
            throw serviceError("Reference ID already exists for this account", 409);
        }
        throw err;
    }
    finally {
        await session.endSession();
    }
}
export async function getTransactionHistory(accountId, options = {}) {
    const account = await Account.findOne({ accountId });
    if (!account) {
        throw serviceError("Account not found", 404);
    }
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const filter = { accountId };
    if (options.type) {
        filter.type = options.type;
    }
    const [transactions, total] = await Promise.all([
        Transaction.find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Transaction.countDocuments(filter),
    ]);
    return {
        transactions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
