import express from "express";
import {
  createTrade,
  getAllTrades,
  getTradeById,
  bulkCreateTrades,
} from "../controllers/tradeController.js";

const router = express.Router();

router.post("/", createTrade);
router.get("/", getAllTrades);
router.get("/:id", getTradeById);
router.post("/bulk", bulkCreateTrades);

export default router;
