import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

const MyBookings = () => {
  const { axios, getToken } = useAppContext();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Your exact functional logic remains unchanged
  const fetchBookings = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.get("/api/bookings/user", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [axios, getToken]);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    if (success === "true" && sessionId) {
      const verifyPayment = async () => {
        try {
          const token = await getToken();
          const { data } = await axios.post(
            "/api/bookings/verify",
            { sessionId },
            { headers: { authorization: `Bearer ${token}` } },
          );
          if (data.success) {
            toast.success("Payment Successful!");
            fetchBookings();
            navigate("/my-bookings", { replace: true });
          } else toast.error("Payment Verification Failed");
        } catch (error) {
          toast.error("Error verifying payment");
        }
      };
      verifyPayment();
    }
  }, [searchParams, getToken, axios, navigate]);

  const handlePayNow = async (bookingId) => {
    setPaymentLoading(bookingId);
    try {
      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        { bookingId },
        { headers: { authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) window.location.href = data.url;
      else toast.error(data.message);
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking permanently?")) return;
    try {
      const { data } = await axios.post(
        "/api/bookings/cancel",
        { bookingId },
        { headers: { authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success("Booking Cancelled");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="py-28 md:py-32 px-5 md:px-16 lg:px-24 xl:px-32 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Title
          title="Your Trips"
          subtitle="Manage your upcoming stays and past reservations."
          align="left"
        />

        <div className="mt-10 space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 text-lg mb-4">
                You have no upcoming trips.
              </p>
              <button
                onClick={() => navigate("/rooms")}
                className="text-blue-600 font-medium hover:underline"
              >
                Start exploring destinations
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition"
              >
                {/* Image Section */}
                <div className="w-full md:w-64 h-48 md:h-auto">
                  <img
                    src={booking.room.images[0]}
                    alt="hotel"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-playfair font-bold text-gray-900">
                        {booking.hotel.name}
                      </h2>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${booking.isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                      >
                        {booking.isPaid
                          ? "Payment Verified"
                          : "Action Required"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      {booking.hotel.city} • {booking.room.roomType}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-gray-400 font-medium">Check-In</p>
                        <p className="text-gray-800 font-semibold">
                          {new Date(booking.checkInDate).toDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-medium">Guests</p>
                        <p className="text-gray-800 font-semibold">
                          {booking.guests}{" "}
                          {booking.guests > 1 ? "Guests" : "Guest"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-wrap items-center justify-between mt-6 pt-6 border-t border-gray-100 gap-4">
                    <p className="text-xl font-bold text-gray-900">
                      ₹{booking.totalPrice}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Cancel Stay
                      </button>
                      {!booking.isPaid && (
                        <button
                          onClick={() => handlePayNow(booking._id)}
                          disabled={paymentLoading === booking._id}
                          className="px-6 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 shadow-sm transition active:scale-95"
                        >
                          {paymentLoading === booking._id
                            ? "Loading..."
                            : "Pay Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
