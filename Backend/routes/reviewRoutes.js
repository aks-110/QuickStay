import express from "express";
import { addReview, getRoomReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, addReview);
reviewRouter.get("/:roomId", getRoomReviews);

export default reviewRouter;
