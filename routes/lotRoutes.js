import express from "express";
import { getAllLots, getLotById } from "../controllers/lotController.js";

const router = express.Router();

router.get("/", getAllLots);
router.get("/:id", getLotById);

export default router;
