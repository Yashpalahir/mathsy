import express from "express";
import { getMyFeeStatus, createFeeStatus } from "../controllers/feeStatusController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/my", protect, getMyFeeStatus);
router.post("/", protect, authorize("admin"), createFeeStatus);

export default router;
