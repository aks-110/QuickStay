import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
  cancelBooking, // Imported new function
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);

// Fixed typo: stripe-payement -> stripe-payment
bookingRouter.post('/stripe-payment', protect, stripePayment);

// New Route
bookingRouter.post('/cancel', protect, cancelBooking);

export default bookingRouter;