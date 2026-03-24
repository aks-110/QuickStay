import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, user, getToken, currencySymbol, convertPrice } =
    useAppContext();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Booking States
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Pay At Hotel");
  const [isAvailable, setIsAvailable] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");

  // ⭐ 1. Safely Fetch Room Data
  const fetchRoomData = async () => {
    setLoadingRoom(true);
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        // Force string comparison just to be safe
        const foundRoom = data.rooms.find((r) => String(r._id) === String(id));

        if (foundRoom) {
          setRoom(foundRoom);
        } else {
          toast.error("Room not found or might have been removed.");
          navigate("/rooms"); // Send back if room doesn't exist
        }
      }
    } catch (error) {
      console.error("Fetch Room Error:", error);
      toast.error("Failed to load room details");
    } finally {
      setLoadingRoom(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${id}`);
      if (data.success) setReviews(data.reviews);
    } catch (e) {
      console.error("Reviews Error:", e);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoomData();
      fetchReviews();
    }
  }, [id, axios]);

  // ⭐ 2. Availability Check
  const checkAvailability = async () => {
    if (!room) return;
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both Check-In and Check-Out dates");
      return;
    }

    setLoadingAction(true);
    try {
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        toast.error("Check-out date must be AFTER check-in date");
        return;
      }
      const { data } = await axios.post("/api/bookings/check-availability", {
        room: room._id,
        checkInDate,
        checkOutDate,
      });

      if (data.success) {
        setIsAvailable(data.isAvailable);
        if (data.isAvailable)
          toast.success("Room is Available! Proceed to book.");
        else toast.error("Sorry, room is already booked for these dates.");
      } else {
        setIsAvailable(false);
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // ⭐ 3. Final Booking Submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book a room");
      return;
    }

    // If not checked availability yet, do it first
    if (!isAvailable) {
      await checkAvailability();
      return;
    }

    setLoadingAction(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/bookings/book",
        { room: room._id, checkInDate, checkOutDate, guests, paymentMethod },
        { headers: { authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        toast.success("Booking Confirmed Successfully!");
        setTimeout(() => {
          navigate("/my-bookings");
          window.scrollTo(0, 0);
        }, 1500);
      } else {
        toast.error(data.message);
        setLoadingAction(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setLoadingAction(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/reviews",
        { room: id, rating: myRating, comment: myComment },
        { headers: { authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success("Review Submitted!");
        setMyComment("");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error submitting review");
    }
  };

  // Safe Date for min attributes (Today's Date)
  const todayDate = new Date().toISOString().split("T")[0];

  if (loadingRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!room) return null; // Fallback if still no room

  return (
    <div className="pt-28 pb-20 px-4 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
      {/* ⭐ HEADER (Crash-proof with Optional Chaining ?.) */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900">
          {room.hotel?.name || "Luxury Stay"}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <StarRating />{" "}
            <span className="font-medium text-gray-900">4.9</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <img src={assets.locationIcon} alt="loc" className="w-4" />
            <span>
              {room.hotel?.address || "Address unavailable"},{" "}
              {room.hotel?.city || "Unknown City"}
            </span>
          </div>
        </div>
      </div>

      {/* ⭐ IMAGE GRID (Crash-proof) */}
      <div className="flex flex-col md:flex-row gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
        <div className="w-full md:w-1/2 h-full bg-gray-100">
          <img
            src={room.images?.[0] || assets.defaultImagePlaceholder}
            alt="Main"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:grid w-1/2 grid-cols-2 grid-rows-2 gap-2 h-full bg-gray-100">
          {room.images?.slice(1, 5).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Gallery"
              className="w-full h-full object-cover"
            />
          ))}
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex flex-col lg:flex-row gap-12 relative">
        <div className="w-full lg:w-[60%]">
          <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Hosted by {room.hotel?.name || "Verified Host"}
              </h2>
              <p className="text-gray-500 mt-1">
                {room.roomType || "Standard Room"} • Accommodates Guests
              </p>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-6">What this place offers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-10 border-b border-gray-200 pb-10">
            {roomCommonData.map((spec, index) => (
              <div key={index} className="flex items-start gap-4">
                <img src={spec.icon} alt="icon" className="w-8 opacity-80" />
                <div>
                  <p className="font-medium text-gray-900">{spec.title}</p>
                  <p className="text-sm text-gray-500">{spec.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* REVIEWS SECTION */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Guest Reviews</h2>
            {user && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white shadow-sm p-6 rounded-2xl mb-10 border border-gray-200"
              >
                <p className="font-semibold mb-3">Rate your stay</p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <svg
                      key={num}
                      onClick={() => setMyRating(num)}
                      className={`w-7 h-7 cursor-pointer transition-colors ${myRating >= num ? "text-yellow-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  required
                  placeholder="Share details of your own experience at this place..."
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none h-28 bg-gray-50"
                ></textarea>
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-2.5 rounded-lg hover:bg-gray-800 font-medium"
                >
                  Post Review
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={rev.user?.image || assets.profileIcon}
                        alt="user"
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rev.user?.username || "Verified Guest"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(rev.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ⭐ STICKY BOOKING WIDGET */}
        <div className="w-full lg:w-[40%] relative">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 lg:sticky lg:top-28">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {convertPrice(room.pricePerNight)}
              </span>
              <span className="text-gray-500">night</span>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-4">
              <div className="flex flex-col border border-gray-300 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-300">
                  <div className="w-1/2 p-3 border-r border-gray-300 bg-gray-50">
                    <label className="block text-[10px] font-bold uppercase text-gray-800">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={todayDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setIsAvailable(false);
                      }}
                      className="w-full text-sm outline-none mt-1 bg-transparent cursor-pointer"
                      required
                    />
                  </div>
                  <div className="w-1/2 p-3 bg-gray-50">
                    <label className="block text-[10px] font-bold uppercase text-gray-800">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate || todayDate}
                      disabled={!checkInDate}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setIsAvailable(false);
                      }}
                      className="w-full text-sm outline-none mt-1 bg-transparent cursor-pointer"
                      required
                    />
                  </div>
                </div>
                <div className="p-3 bg-gray-50">
                  <label className="block text-[10px] font-bold uppercase text-gray-800">
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full text-sm outline-none mt-1 bg-transparent"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex gap-3">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === "Pay At Hotel" ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 text-gray-500"}`}
                  >
                    <input
                      type="radio"
                      value="Pay At Hotel"
                      checked={paymentMethod === "Pay At Hotel"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />{" "}
                    At Hotel
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === "Online" ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 text-gray-500"}`}
                  >
                    <input
                      type="radio"
                      value="Online"
                      checked={paymentMethod === "Online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />{" "}
                    Pay Online
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className={`w-full mt-4 text-white font-bold py-4 rounded-xl shadow-md transition-all ${loadingAction ? "bg-gray-400 opacity-70" : isAvailable ? "bg-green-600 hover:bg-green-700 active:scale-[0.98]" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}`}
              >
                {loadingAction
                  ? "Processing..."
                  : isAvailable
                    ? `Reserve Now`
                    : "Check Availability"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
