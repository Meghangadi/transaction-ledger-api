
import { Router } from "express";
import {
  createAccountController,
  getBalanceController,
} from "../controllers/account.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createAccountSchema } from "../validators/account.validator.js";

const router = Router();

router.post(
  "/",
  validateBody(createAccountSchema),
  createAccountController
);

router.get("/:accountId/balance", getBalanceController);

export default router;
