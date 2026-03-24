import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const addReview = async (req, res) => {
  try {
    const { room, rating, comment } = req.body;
    const user = req.user._id;

    const hasBooked = await Booking.findOne({ user, room, isPaid: true });
    if (!hasBooked) {
      return res.json({
        success: false,
        message: "You can only review rooms you have stayed in.",
      });
    }

    const existingReview = await Review.findOne({ user, room });
    if (existingReview) {
      return res.json({
        success: false,
        message: "You have already reviewed this room.",
      });
    }

    await Review.create({ user, room, rating: Number(rating), comment });
    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;
    const reviews = await Review.find({ room: roomId })
      .populate("user", "username image")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
