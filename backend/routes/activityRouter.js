import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  getStats,
  logActivity,
  analytics,
  replayCheck,
} from "../controllers/activityController.js";

const router = express.Router();

router.post("/log-activity", protectRoute, logActivity);
router.get("/stats", protectRoute, getStats);
router.get("/suspicious", protectRoute, analytics);
router.post("/replay-check", protectRoute, replayCheck);

export default router;
