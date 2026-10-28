
import { Router } from "express";
import {
  createTransactionController,
  getTransactionHistoryController,
} from "../controllers/transaction.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createTransactionSchema } from "../validators/transaction.validator.js";

const router = Router();


router.post(
  "/:accountId/transactions",
  validateBody(createTransactionSchema),
  createTransactionController
);

router.get(
  "/:accountId/transactions",
  getTransactionHistoryController
);

export default router;
