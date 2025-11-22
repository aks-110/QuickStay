import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";

// --- HELPER FUNCTIONS ---
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

// --- BOOKING CONTROLLERS ---

export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailabilityHelper(room, checkInDate, checkOutDate);
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
    const user = req.user._id;

    // 1. Check Availability
    const isAvailable = await checkAvailabilityHelper(room, checkInDate, checkOutDate);

    if (!isAvailable) {
      return res.json({ success: false, message: "Room not available for these dates" });
    }

    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData) return res.json({ success: false, message: "Room not found" });

    // 2. Restriction: Prevent Owner Booking
    if (roomData.hotel.owner.toString() === user.toString()) {
      return res.json({ success: false, message: "You cannot book your own room" });
    }

    let totalPrice = roomData.pricePerNight;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;

    totalPrice = totalPrice * nights;

    // 3. Create Booking
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

    // 4. Send Enhanced Email
    try {
      if (req.user.email) {
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: req.user.email,
          subject: `Booking Confirmed - ${roomData.hotel.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Booking Confirmed</h1>
              </div>
              <div style="padding: 20px; color: #333;">
                <p>Dear <strong>${req.user.username}</strong>,</p>
                <p>Thank you for choosing <strong>${roomData.hotel.name}</strong>! We are pleased to confirm your stay.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #555;">Reservation Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${newBooking._id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Room Type:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${roomData.roomType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Check-In:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${checkIn.toDateString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Check-Out:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${checkOut.toDateString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${guests}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment Method:</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${paymentMethod || "Pay At Hotel"}</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                  <p style="font-size: 16px; color: #666; margin-bottom: 5px;">Total Amount</p>
                  <h2 style="color: #000; margin: 0; font-size: 28px;">₹${totalPrice}</h2>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

                <p style="font-size: 12px; color: #888; text-align: center;">
                  Need help? Contact the hotel directly or reply to this email.<br/>
                  We wish you a pleasant stay!
                </p>
              </div>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.error("Email failed to send:", emailError.message);
    }

    res.json({ success: true, message: "Booking created successfully" });
  } catch (error) {
    console.log(error);
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

    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue },
      bookings,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

// --- PAYMENT & CANCELLATION ---

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const { origin } = req.headers;

    // 1. Safety Check for Stripe Key
    if (!process.env.STRIPE_SECRET_KEY) {
        return res.json({ success: false, message: "Stripe Secret Key is missing in Server" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    const totalPrice = booking.totalPrice;

    // 2. Setup Frontend URL (Handles Localhost & Vercel)
    const frontendUrl = origin ? origin.replace(/\/$/, "") : "http://localhost:5173";

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "inr", 
          product_data: {
            name: `${roomData.hotel.name} - ${roomData.roomType}`,
          },
          unit_amount: Math.round(totalPrice * 100), // Ensure integer
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      // 3. Pass Session ID in URL for Verification
      success_url: `${frontendUrl}/my-bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/my-bookings?canceled=true`,
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.json({ success: false, message: "Payment Failed: " + error.message });
  }
};

// ⭐ Verify Payment Endpoint (Required for Localhost/Vercel without Webhooks)
export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe Key Missing");

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { bookingId } = session.metadata;
            
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentMethod: "Stripe"
            });

            res.json({ success: true, message: "Payment Verified Successfully" });
        } else {
            res.json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Verification Failed" });
    }
}

export const cancelBooking = async (req, res) => {
    try {
      const { bookingId } = req.body;
      const userId = req.user._id;
  
      const booking = await Booking.findById(bookingId).populate("hotel");
  
      if (!booking) {
        return res.json({ success: false, message: "Booking not found" });
      }
  
      // Authorization Check: User OR Owner
      const isUser = booking.user.toString() === userId.toString();
      const isOwner = booking.hotel.owner.toString() === userId.toString();
  
      if (!isUser && !isOwner) {
        return res.json({ success: false, message: "Not authorized to cancel this booking" });
      }
  
      // Hard Delete
      await Booking.findByIdAndDelete(bookingId);
  
      res.json({ success: true, message: "Booking cancelled and removed successfully" });
  
    } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
    }
};