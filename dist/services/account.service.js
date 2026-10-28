import { Account } from "../models/account.model.js";
export async function createAccount(accountId, name) {
    const existing = await Account.findOne({ accountId });
    if (existing) {
        const error = new Error("Account ID already exists");
        Object.assign(error, { statusCode: 409 });
        throw error;
    }
    try {
        return await Account.create({
            accountId,
            name,
            balance: 0,
        });
    }
    catch (err) {
        // Handles concurrent requests using the same account ID.
        if (err?.code === 11000) {
            const error = new Error("Account ID already exists");
            Object.assign(error, { statusCode: 409 });
            throw error;
        }
        throw err;
    }
}
export async function getAccount(accountId) {
    const account = await Account.findOne({ accountId });
    if (!account) {
        const error = new Error("Account not found");
        Object.assign(error, { statusCode: 404 });
        throw error;
    }
    return account;
}
