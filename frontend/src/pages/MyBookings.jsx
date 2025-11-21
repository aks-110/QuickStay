import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken } = useAppContext();
  const [bookings, setBookings] = useState([]);
  // State to track which specific booking is currently processing payment
  const [paymentLoading, setPaymentLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/bookings/user", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [axios, getToken]);

  // ⭐ Handle Pay Now Click
  const handlePayNow = async (bookingId) => {
    try {
      setPaymentLoading(bookingId); // Show loading only for this button
      const token = await getToken();

      // Simulate a payment gateway delay (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data } = await axios.post(
        "/api/bookings/verify",
        { bookingId },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchBookings(); // Refresh data to update UI to "Paid"
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Payment failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen">
      <Title
        title="My Bookings"
        subtitle="Easily manage your past, current, and upcoming hotel reservations."
        align="left"
      />

      <div className="max-w-6xl mt-10 w-full text-gray-800 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        {/* Header Row (Hidden on mobile) */}
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-semibold text-base py-3 text-gray-700">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-200 py-6 first:border-t bg-white hover:bg-gray-50 transition rounded-xl px-2"
          >
            {/* 1. Hotel Details */}
            <div className="flex flex-col md:flex-row gap-4">
              <img
                src={booking.room.images[0]}
                alt="hotel-img"
                className="w-full md:w-40 h-32 object-cover rounded-xl shadow-md"
              />
              <div className="flex flex-col gap-1.5">
                <p className="font-playfair text-2xl font-semibold text-gray-900">
                  {booking.hotel.name}
                  <span className="font-inter text-sm pl-2 text-gray-600">
                    ({booking.room.roomType})
                  </span>
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <img
                    src={assets.guestsIcon}
                    alt="guests-icon"
                    className="w-4"
                  />
                  <span>Guests: {booking.guests}</span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  Total:{" "}
                  <span className="text-indigo-600">₹{booking.totalPrice}</span>
                </p>
              </div>
            </div>

            {/* 2. Dates */}
            <div className="flex flex-row md:items-center md:gap-12 mt-4 md:mt-0 gap-10 text-gray-700">
              <div>
                <p className="font-medium">Check-In</p>
                <p className="text-gray-500 text-sm">
                  {new Date(booking.checkInDate).toDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium">Check-Out</p>
                <p className="text-gray-500 text-sm">
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
              </div>
            </div>

            {/* 3. Payment Status & Action */}
            <div className="flex flex-col items-start justify-center mt-4 md:mt-0 gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    booking.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <p className="text-sm font-medium">
                  {booking.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>

              {/* ⭐ PAY NOW BUTTON (Visible only if Unpaid) */}
              {!booking.isPaid && (
                <button
                  onClick={() => handlePayNow(booking._id)}
                  disabled={paymentLoading === booking._id}
                  className={`px-5 py-2 text-xs font-medium rounded-full transition-all shadow-md active:scale-95
                    ${
                      paymentLoading === booking._id
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                  {paymentLoading === booking._id ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;