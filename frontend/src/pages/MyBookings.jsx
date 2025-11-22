import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

const MyBookings = () => {
  const { axios, getToken } = useAppContext();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(null);
  
  // Get URL Params to check for Stripe Success
  const [searchParams] = useSearchParams();

  const fetchBookings = async () => {
    try {
      const token = await getToken();
      if(!token) return; // Wait for auth
      const { data } = await axios.get("/api/bookings/user", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [axios, getToken]);

  // ⭐ VERIFY PAYMENT ON RETURN
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId) {
      const verifyPayment = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/bookings/verify', 
                { sessionId },
                { headers: { authorization: `Bearer ${token}` }}
            );

            if(data.success){
                toast.success("Payment Successful!");
                fetchBookings(); // Refresh data to show "Paid"
                // Clean URL
                navigate("/my-bookings", { replace: true });
            } else {
                toast.error("Payment Verification Failed");
            }
        } catch (error) {
            console.error("Verification Error", error);
            toast.error("Error verifying payment");
        }
      }
      verifyPayment();
    }
  }, [searchParams, getToken, axios, navigate]);

  const handlePayNow = async (bookingId) => {
    setPaymentLoading(bookingId);
    try {
      const { data } = await axios.post('/api/bookings/stripe-payment',
        { bookingId },
        { headers: { authorization: `Bearer ${await getToken()}` } }
      );
      
      if (data.success) {
        // Redirect to Stripe
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment initialization failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if(!confirm("Are you sure you want to cancel this booking? This cannot be undone.")) return;

    try {
        const { data } = await axios.post('/api/bookings/cancel',
            { bookingId },
            { headers: { authorization: `Bearer ${await getToken()}` } }
        );
        if (data.success) {
            toast.success(data.message);
            setBookings((prev) => prev.filter(b => b._id !== bookingId));
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen">
      <Title title="My Bookings" subtitle="Manage your reservations." align="left" />

      <div className="max-w-6xl mt-10 w-full text-gray-800 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1.2fr] w-full border-b border-gray-300 font-semibold text-base py-3 text-gray-700">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Actions & Payment</div>
        </div>
        
        {bookings.length === 0 && <p className="text-center py-10 text-gray-500">No bookings found.</p>}

        {bookings.map((booking) => (
          <div key={booking._id} className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1.2fr] w-full border-b border-gray-200 py-6 first:border-t bg-white hover:bg-gray-50 transition rounded-xl px-2">
            <div className="flex flex-col md:flex-row gap-4">
              <img src={booking.room.images[0]} alt="hotel" className="w-full md:w-40 h-32 object-cover rounded-xl shadow-md" />
              <div className="flex flex-col gap-1.5">
                <p className="font-playfair text-2xl font-semibold text-gray-900">{booking.hotel.name}</p>
                <p className="text-base font-semibold text-gray-900">Total: <span className="text-indigo-600">₹{booking.totalPrice}</span></p>
              </div>
            </div>

            <div className="flex flex-row md:items-center gap-10 text-gray-700">
              <div><p className="font-medium">Check-In</p><p className="text-gray-500 text-sm">{new Date(booking.checkInDate).toDateString()}</p></div>
            </div>

            <div className="flex flex-col items-start justify-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></span>
                <p className="text-sm font-medium">{booking.isPaid ? "Paid" : "Unpaid"}</p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[140px]">
                  {!booking.isPaid && (
                    <button onClick={() => handlePayNow(booking._id)} disabled={paymentLoading === booking._id} className="px-5 py-2 text-xs font-medium rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95">
                      {paymentLoading === booking._id ? "Processing..." : "Pay Now"}
                    </button>
                  )}
                  <button onClick={() => handleCancel(booking._id)} className="px-5 py-2 text-xs font-medium rounded-full border border-red-500 text-red-600 hover:bg-red-50 transition-all active:scale-95">Cancel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;