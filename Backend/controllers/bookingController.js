import transporter  from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Helper function
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
      checkOutDate
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

    // 1. Check Availability
    const isAvailable = await checkAvailabilityHelper(
      room,
      checkInDate,
      checkOutDate
    );

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room not available for these dates",
      });
    }

    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData)
      return res.json({ success: false, message: "Room not found" });

    // 2. Restriction: Prevent Owner Booking
    if (roomData.hotel.owner.toString() === user.toString()) {
      return res.json({
        success: false,
        message: "You cannot book your own room",
      });
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

    // 4. Send Email (Safe Mode - won't crash if email fails)
    try {
      if (req.user.email) {
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: req.user.email,
          subject: "Hotel Booking Details",
          html: `
          <h2>Your booking details:</h2>
          <p>Dear ${req.user.username},</p>
          <p>Thank you for your booking! Here are your details: </p>
          <ul>
            <li><strong> Booking ID: </strong> ${newBooking._id}</li>
            <li><strong> Hotel Name: </strong> ${roomData.hotel.name}</li>
            <li><strong> Room Type: </strong> ${roomData.roomType}</li>
            <li><strong> Check-in Date: </strong> ${checkIn.toDateString()}</li>
            <li><strong> Check-out Date: </strong> ${checkOut.toDateString()}</li>
            <li><strong> Total Price: </strong> ₹${totalPrice}</li>
            <li><strong> Payment Method: </strong> ${paymentMethod || "Pay At Hotel"}</li>
            <li><strong> Guests: </strong> ${guests}</li>
          </ul>
          <p>We look forward to welcoming you!</p>
          <p>Best regards,</p>
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
    const { userId } = req.auth();
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

// ⭐ NEW FUNCTION: Handle Payment Logic
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // Security Check: Ensure the logged-in user owns this booking
    if (booking.user.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (booking.isPaid) {
      return res.json({ success: false, message: "Booking is already paid" });
    }

    // Mark as Paid
    booking.isPaid = true;
    booking.paymentMethod = "Online (Verified)";
    await booking.save();

    res.json({ success: true, message: "Payment Successful! Booking Updated." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};