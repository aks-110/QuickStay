import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
  verifyPayment,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Public/Protected logic handled in controller or middleware
bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);

// Payment Routes
bookingRouter.post('/stripe-payment', protect, stripePayment);
bookingRouter.post('/verify', protect, verifyPayment);

// Cancel Route
bookingRouter.post('/cancel', protect, cancelBooking);

export default bookingRouter;