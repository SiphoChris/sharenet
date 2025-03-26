import express from "express";
import { registerUser, loginUser, deleteUser } from "../controllers/user.controller.js";
import {
  addToWatchlist,
  clearWatchlist,
  getWatchlistsByUserId,
  removeOneFromWatchlist,
} from "../controllers/watchlist.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.use(verifyToken);

// User routes
router.delete("/:user_id", deleteUser);

// Watchlist routes
router.get("/:user_id/watchlist", getWatchlistsByUserId);
router.post("/watchlist", addToWatchlist);
router.delete("/watchlist/:share_code", removeOneFromWatchlist);
router.delete("/watchlist", clearWatchlist);

export {router as userRouter};