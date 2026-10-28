import { createAccount, getAccount } from "../services/account.service.js";
import { createAccountSchema } from "../validators/account.validator.js";
function getAccountId(req) {
    const value = req.params.accountId;
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
export async function createAccountController(req, res, next) {
    try {
        const input = createAccountSchema.parse(req.body);
        const account = await createAccount(input.accountId, input.name);
        res.status(201).json({
            message: "Account created successfully",
            data: account,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getBalanceController(req, res, next) {
    try {
        const account = await getAccount(getAccountId(req));
        res.status(200).json({
            accountId: account.accountId,
            balance: account.balance,
        });
    }
    catch (error) {
        next(error);
    }
}
