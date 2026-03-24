import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";

const checkAvailabilityHelper = async (room, checkInDate, checkOutDate) => {
  const bookings = await Booking.find({
    room,
    $or: [
      {
        checkInDate: { $lte: new Date(checkOutDate) },
        checkOutDate: { $gte: new Date(checkInDate) },
      },
    ],
  });
  return bookings.length === 0;
};

export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailabilityHelper(
      room,
      checkInDate,
      checkOutDate,
    );
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailabilityHelper(
      room,
      checkInDate,
      checkOutDate,
    );
    if (!isAvailable)
      return res.json({ success: false, message: "Room not available" });

    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData)
      return res.json({ success: false, message: "Room not found" });

    if (roomData.hotel.owner.toString() === user.toString()) {
      return res.json({
        success: false,
        message: "You cannot book your own room",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights =
      Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24),
      ) || 1;
    const totalPrice = roomData.pricePerNight * nights;

    const newBooking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: Number(guests),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
      paymentMethod: paymentMethod || "Pay At Hotel",
    });

    
    try {
      if (req.user.email && paymentMethod === "Pay At Hotel") {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: req.user.email,
          subject: `Booking Reserved - ${roomData.hotel.name}`,
          html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2196F3;">Booking Reserved! 🏨</h2>
                    <p>Hi ${req.user.username},</p>
                    <p>Your stay at <b>${roomData.hotel.name}</b> from <b>${checkIn.toDateString()}</b> to <b>${checkOut.toDateString()}</b> is reserved.</p>
                    <p>Total Amount: <b>₹${totalPrice}</b>. Please pay at the hotel during check-in.</p>
                  </div>`,
        });
        console.log(" Booking Email sent to:", req.user.email);
      }
    } catch (emailErr) {
      console.log(" Email 1 Failed:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Booking created successfully",
      bookingId: newBooking._id,
    });
  } catch (error) {
    res.json({ success: false, message: "Booking failed: " + error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const { userId } = req.auth;
    const hotel = await Hotel.findOne({ owner: userId });
    if (!hotel) return res.json({ success: false, message: "Hotel not found" });

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue },
      bookings,
    });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

// --- PAYMENT LOGIC ---
export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const { origin } = req.headers;
    if (!process.env.STRIPE_SECRET_KEY)
      return res.json({ success: false, message: "Stripe Key missing" });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.json({ success: false, message: "Booking not found" });

    const roomData = await Room.findById(booking.room).populate("hotel");
    const frontendUrl = origin
      ? origin.replace(/\/$/, "")
      : "http://localhost:5173";
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${roomData.hotel.name} - ${roomData.roomType}`,
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/my-bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/my-bookings?canceled=true`,
      metadata: { bookingId: bookingId.toString() },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, message: "Payment Failed: " + error.message });
  }
};

// ⭐ 2. VERIFY PAYMENT & SUCCESS EMAIL
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe Key Missing");

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const { bookingId } = session.metadata;

      const existingBooking =
        await Booking.findById(bookingId).populate("hotel user");
      if (existingBooking.isPaid)
        return res.json({ success: true, message: "Already Verified" });

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
        transactionId: session.payment_intent, // Save for refund
      });

      // ✉️ EMAIL 2: Payment Success
      try {
        if (existingBooking.user && existingBooking.user.email) {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: existingBooking.user.email,
            subject: `Payment Successful - ${existingBooking.hotel.name}`,
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                <h2 style="color: #4CAF50;">Payment Received! 🎉</h2>
                                <p>Hi ${existingBooking.user.username},</p>
                                <p>We received your payment of <b>₹${existingBooking.totalPrice}</b> for <b>${existingBooking.hotel.name}</b>.</p>
                                <p>Your booking is fully confirmed!</p>
                            </div>`,
          });
          console.log("✉️ Success Email sent to:", existingBooking.user.email);
        }
      } catch (emailErr) {
        console.log("❌ Email 2 Failed:", emailErr.message);
      }

      res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    res.json({ success: false, message: "Verification Failed" });
  }
};

// ⭐ 3. CANCEL BOOKING, REFUND & EMAIL
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    const booking =
      await Booking.findById(bookingId).populate("hotel user room");
    if (!booking)
      return res.json({ success: false, message: "Booking not found" });

    const isUser = booking.user._id.toString() === userId.toString();
    const isOwner = booking.hotel.owner.toString() === userId.toString();
    if (!isUser && !isOwner)
      return res.json({ success: false, message: "Not authorized to cancel" });

    // ⭐ PROCESS STRIPE REFUND
    let refundStatusMsg = "";
    if (booking.isPaid && booking.transactionId) {
      try {
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        await stripeInstance.refunds.create({
          payment_intent: booking.transactionId,
        });
        refundStatusMsg = `A refund of ₹${booking.totalPrice} has been initiated to your original payment method (Takes 3-5 days).`;
      } catch (refundError) {
        console.error("Refund Error:", refundError.message);
        return res.json({
          success: false,
          message: "Cancellation failed due to Stripe refund error.",
        });
      }
    } else {
      refundStatusMsg = "No payment was made online, so no refund is required.";
    }

    // ✉️ EMAIL 3: Cancellation & Refund
    try {
      if (booking.user && booking.user.email) {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: booking.user.email,
          subject: `Booking Cancelled - ${booking.hotel.name}`,
          html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                          <h2 style="color: #F44336;">Booking Cancelled</h2>
                          <p>Hi ${booking.user.username},</p>
                          <p>Your booking at <b>${booking.hotel.name}</b> has been cancelled.</p>
                          <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #F44336;">
                              <b>Refund Status:</b> ${refundStatusMsg}
                          </p>
                      </div>`,
        });
        console.log("✉️ Cancel Email sent to:", booking.user.email);
      }
    } catch (emailErr) {
      console.log("❌ Email 3 Failed:", emailErr.message);
    }

    await Booking.findByIdAndDelete(bookingId);
    res.json({
      success: true,
      message: "Booking cancelled and refunded successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
