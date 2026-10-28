import { Router } from "express";
import { createTransactionController, getTransactionHistoryController, } from "../controllers/transaction.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createTransactionSchema } from "../validators/transaction.validator.js";
const router = Router();
// Add a credit or debit transaction
router.post("/:accountId/transactions", validateBody(createTransactionSchema), createTransactionController);
// Get transaction history
router.get("/:accountId/transactions", getTransactionHistoryController);
export default router;
