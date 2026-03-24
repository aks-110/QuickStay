import express from "express";
import { registerHotel, deleteHotel } from "../controllers/hotelController.js";
import { protect } from "../middleware/authMiddleware.js";

const hotelRouter = express.Router();

hotelRouter.post("/", protect, registerHotel);
hotelRouter.post("/remove", protect, deleteHotel); // The mass deletion route

export default hotelRouter;
