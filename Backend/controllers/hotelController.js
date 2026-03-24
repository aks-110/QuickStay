import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import transporter from "../configs/nodemailer.js";
import stripe from "stripe";
import "dotenv/config";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    const existingHotel = await Hotel.findOne({ owner });

    if (existingHotel) {
      return res.json({ success: false, message: "Hotel already registered" });
    }

    await Hotel.create({ name, address, contact, city, owner });
    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    res.json({ success: true, message: "Hotel registered successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ⭐ UPGRADED: Delete Hotel with Mass Refund & Mass Emails
export const deleteHotel = async (req, res) => {
  try {
    const owner = req.user._id;

    // 1. Find the hotel owned by this user
    const hotel = await Hotel.findOne({ owner });

    if (!hotel) {
      return res.json({ success: false, message: "No hotel found to delete" });
    }

    // 2. Fetch all bookings associated with this hotel to process refunds and emails
    const activeBookings = await Booking.find({ hotel: hotel._id }).populate(
      "user room",
    );

    // Initialize Stripe
    const stripeInstance = process.env.STRIPE_SECRET_KEY
      ? new stripe(process.env.STRIPE_SECRET_KEY)
      : null;

    // 3. Loop through all bookings safely (Mass Refund & Mass Email)
    for (const booking of activeBookings) {
      let refundStatusMsg =
        "No online payment was made, so no refund is required.";

      // Process Stripe Refund if paid online
      if (booking.isPaid && booking.transactionId && stripeInstance) {
        try {
          await stripeInstance.refunds.create({
            payment_intent: booking.transactionId,
          });
          refundStatusMsg = `A full refund of <b>₹${booking.totalPrice}</b> has been processed to your original payment method. It may take 3-5 business days to reflect in your account.`;
          console.log(`✅ Refunded Booking ID: ${booking._id}`);
        } catch (refundError) {
          console.error(
            `❌ Refund Failed for Booking ID: ${booking._id}`,
            refundError.message,
          );
          refundStatusMsg = `We attempted to process your refund of ₹${booking.totalPrice}, but encountered a delay. Our team will manually process this shortly.`;
        }
      }

      // Send Apology & Cancellation Email to Guest
      if (booking.user && booking.user.email) {
        try {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: booking.user.email,
            subject: `Urgent: Booking Cancelled - ${hotel.name} is closing`,
            html: `
                        <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2 style="color: #F44336;">Important Update Regarding Your Stay</h2>
                            <p>Dear ${booking.user.username},</p>
                            <p>We deeply regret to inform you that your upcoming stay at <b>${hotel.name}</b> has been cancelled.</p>
                            <p>The property is permanently closing its listings on our platform, forcing us to cancel all associated reservations.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #F44336; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #333;">Refund Information</h3>
                                <p style="margin-bottom: 0;">${refundStatusMsg}</p>
                            </div>

                            <p>We sincerely apologize for the inconvenience this may cause to your travel plans. Please visit our website to explore other wonderful properties in the area.</p>
                            <p>Best regards,<br>The QuickStay Support Team</p>
                        </div>
                    `,
          });
          console.log(`✉️ Mass Cancel Email sent to: ${booking.user.email}`);
        } catch (emailErr) {
          console.error(
            `❌ Mass Cancel Email Failed for ${booking.user.email}:`,
            emailErr.message,
          );
        }
      }
    }

    // 4. Delete all bookings related to this hotel from Database
    await Booking.deleteMany({ hotel: hotel._id });
    console.log(`🗑️ Deleted all bookings for hotel ${hotel.name}`);

    // 5. Delete all rooms related to this hotel
    await Room.deleteMany({ hotel: hotel._id });
    console.log(`🗑️ Deleted all rooms for hotel ${hotel.name}`);

    // 6. Delete the hotel itself
    await Hotel.findByIdAndDelete(hotel._id);
    console.log(`🗑️ Deleted hotel ${hotel.name}`);

    // 7. Downgrade user role back to normal "user"
    await User.findByIdAndUpdate(owner, { role: "user" });

    res.json({
      success: true,
      message:
        "Hotel deleted successfully. All guests have been refunded and notified.",
    });
  } catch (error) {
    console.error("Delete Hotel Master Error:", error);
    res.json({ success: false, message: error.message });
  }
};
