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
          html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2196F3; text-align: center;">Booking Reserved! 🏨</h2>
                    <p>Hi ${req.user.username},</p>
                    <p>Great news! Your stay at <b>${roomData.hotel.name}</b> has been successfully reserved.</p>
                    
                    <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Reservation Details</h3>
                      <ul style="list-style: none; padding: 0; line-height: 1.6;">
                        <li><b>Hotel:</b> ${roomData.hotel.name}</li>
                        <li><b>Address:</b> ${roomData.hotel.address}, ${roomData.hotel.city}</li>
                        <li><b>Hotel Contact:</b> ${roomData.hotel.contact}</li>
                        <li><b>Room Type:</b> ${roomData.roomType}</li>
                        <li><b>Check-In:</b> ${checkIn.toDateString()}</li>
                        <li><b>Check-Out:</b> ${checkOut.toDateString()}</li>
                        <li><b>Guests:</b> ${guests}</li>
                      </ul>
                    </div>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                      <h3 style="margin-top: 0; color: #856404;">Payment Summary</h3>
                      <p><b>Total Amount:</b> ₹${totalPrice}</p>
                      <p><b>Status:</b> To be paid at the hotel</p>
                      <p><i>Please ensure you pay the full amount at the reception during check-in.</i></p>
                    </div>
                    
                    <p>If you have any questions, feel free to contact the hotel directly.</p>
                    <p>Safe travels!<br><b>QuickStay Team</b></p>
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

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe Key Missing");

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const { bookingId } = session.metadata;

      const existingBooking =
        await Booking.findById(bookingId).populate("hotel user room");
      if (existingBooking.isPaid)
        return res.json({ success: true, message: "Already Verified" });

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
        transactionId: session.payment_intent,
      });

      try {
        if (existingBooking.user && existingBooking.user.email) {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: existingBooking.user.email,
            subject: `Payment Successful - ${existingBooking.hotel.name}`,
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #4CAF50; text-align: center;">Payment Successful! 🎉</h2>
                                <p>Hi ${existingBooking.user.username},</p>
                                <p>We have successfully received your payment. Your booking at <b>${existingBooking.hotel.name}</b> is now fully confirmed!</p>
                                
                                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                  <h3 style="margin-top: 0; color: #2e7d32; border-bottom: 1px solid #a5d6a7; padding-bottom: 5px;">Booking & Payment Details</h3>
                                  <ul style="list-style: none; padding: 0; line-height: 1.6;">
                                    <li><b>Hotel:</b> ${existingBooking.hotel.name}</li>
                                    <li><b>Address:</b> ${existingBooking.hotel.address}, ${existingBooking.hotel.city}</li>
                                    <li><b>Room Type:</b> ${existingBooking.room.roomType}</li>
                                    <li><b>Check-In:</b> ${new Date(existingBooking.checkInDate).toDateString()}</li>
                                    <li><b>Check-Out:</b> ${new Date(existingBooking.checkOutDate).toDateString()}</li>
                                    <li><b>Guests:</b> ${existingBooking.guests}</li>
                                    <li><b>Amount Paid:</b> ₹${existingBooking.totalPrice}</li>
                                    <li><b>Transaction ID:</b> ${session.payment_intent}</li>
                                  </ul>
                                </div>

                                <p>You're all set! Just present your ID at the hotel reception upon arrival.</p>
                                <p>We hope you have a wonderful stay!<br><b>QuickStay Team</b></p>
                            </div>`,
          });
          console.log(" Success Email sent to:", existingBooking.user.email);
        }
      } catch (emailErr) {
        console.log(" Email 2 Failed:", emailErr.message);
      }

      res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    res.json({ success: false, message: "Verification Failed" });
  }
};

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

    try {
      if (booking.user && booking.user.email) {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: booking.user.email,
          subject: `Booking Cancelled - ${booking.hotel.name}`,
          html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #F44336; text-align: center;">Booking Cancelled</h2>
                          <p>Hi ${booking.user.username},</p>
                          <p>As requested, your booking at <b>${booking.hotel.name}</b> has been officially cancelled.</p>
                          
                          <div style="background-color: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #c62828; border-bottom: 1px solid #ef9a9a; padding-bottom: 5px;">Cancelled Reservation Details</h3>
                            <ul style="list-style: none; padding: 0; line-height: 1.6;">
                              <li><b>Hotel:</b> ${booking.hotel.name}</li>
                              <li><b>Room Type:</b> ${booking.room.roomType}</li>
                              <li><b>Dates:</b> ${new Date(booking.checkInDate).toDateString()} - ${new Date(booking.checkOutDate).toDateString()}</li>
                            </ul>
                          </div>

                          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F44336;">
                              <h3 style="margin-top: 0; color: #333;">Refund Status</h3>
                              <p>${refundStatusMsg}</p>
                          </div>

                          <p>If you cancelled this by mistake or want to book another stay, visit our website to explore available rooms.</p>
                          <p>Best regards,<br><b>QuickStay Team</b></p>
                      </div>`,
        });
        console.log(" Cancel Email sent to:", booking.user.email);
      }
    } catch (emailErr) {
      console.log(" Email 3 Failed:", emailErr.message);
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
