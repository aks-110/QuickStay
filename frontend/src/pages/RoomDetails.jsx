import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets, facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, user, getToken } = useAppContext();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Pay At Hotel");
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAvailability = async () => {
    if (!room) return;
    try {
      if (checkInDate >= checkOutDate) {
        toast.error("Check-out date must be after check-in date");
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
        else toast.error("Room is not available for these dates");
      } else {
        setIsAvailable(false);
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fixed Typo: onSubmitHandler
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select dates");
      return;
    }

    // Optimistic Availability check
    if (!isAvailable) {
      await checkAvailability();
      // If still not available, stop
      if (!isAvailable) return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: room._id,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod,
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        // Wait for 2 seconds so user sees toast
        setTimeout(() => {
          navigate("/my-bookings");
          window.scrollTo(0, 0);
        }, 2000);
      } else {
        toast.error(data.message);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get("/api/rooms");
        if (data.success) {
          const foundRoom = data.rooms.find((r) => r._id === id);
          if (foundRoom) {
            setRoom(foundRoom);
            setMainImage(foundRoom.images[0]);
          }
        }
      } catch (error) {
        toast.error("Failed to load room details");
      }
    };
    fetchRoom();
  }, [id, axios]);

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* ... Header & Images ... */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 ">
          <h1 className="text-3xl md:text-4xl font-playfair">
            {room.hotel.name}{" "}
            <span className="font-inter text-sm">({room.roomType})</span>
          </h1>
          <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
            20% OFF
          </p>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <StarRating />
          <p className="ml-2">200+ reviews</p>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <img src={assets.locationIcon} alt="loctation-icon" />
          <span>{room.hotel.address}</span>
        </div>

        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-1/2 w-full">
            <img
              src={mainImage}
              alt="Room Image"
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.images.length > 1 &&
              room.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt="Room Image"
                  className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                    mainImage === image && "outline-3 outline-orange-500"
                  }`}
                />
              ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col md:flex-row md:justify-between mt-10">
          <h1 className="text-3xl md:text-4xl font-playfair">
            Experience Luxury Like Never Before
          </h1>
          <p className="text-2xl font-medium">₹{room.pricePerNight}/night</p>
        </div>

        {/* Booking Form */}
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-6 bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-10 text-gray-500">
            <div className="flex flex-col w-full">
              <label htmlFor="checkInDate" className="font-medium">
                Check-In
              </label>
              <input
                type="date"
                id="checkInDate"
                value={checkInDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  setIsAvailable(false);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>

            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>

            <div className="flex flex-col w-full">
              <label htmlFor="checkOutDate" className="font-medium">
                Check-Out
              </label>
              <input
                type="date"
                id="checkOutDate"
                min={checkInDate}
                disabled={!checkInDate}
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  setIsAvailable(false);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>

            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>

            <div className="flex flex-col w-full">
              <label htmlFor="guests" className="font-medium">
                Guests
              </label>
              <input
                type="number"
                id="guests"
                value={guests}
                placeholder="1"
                onChange={(e) => setGuests(e.target.value)}
                min={1}
                className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>
          </div>

          {/* Payment UI */}
          <div className="border-t pt-4 mt-2">
            <p className="font-medium text-gray-700 mb-3">
              Select Payment Method
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <label
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "Pay At Hotel"
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Pay At Hotel"
                  checked={paymentMethod === "Pay At Hotel"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-black w-4 h-4"
                />
                <span className="font-medium">Pay At Hotel</span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "Online"
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Online"
                  checked={paymentMethod === "Online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-black w-4 h-4"
                />
                <span>Pay Online (Card/UPI)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-primary hover:bg-primary-dull text-white rounded-md w-full md:px-25 py-3 md:py-4 text-base cursor-pointer transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : "active:scale-95"
            }`}
          >
            {loading
              ? "Processing..."
              : isAvailable
              ? `Book Now (${paymentMethod})`
              : "Check Availability"}
          </button>
        </form>

        {/* Amenities */}
        <div className="mt-25 space-y-4">
          {roomCommonData.map((spec, index) => (
            <div key={index} className="flex items-start gap-2 ">
              <img
                src={spec.icon}
                alt={`${spec.title}-icon`}
                className="w-6.5"
              />
              <div>
                <p className="text-base">{spec.title}</p>
                <p className="text-gray-500">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Host Info */}
        <div className="flex flex-col items-start gap-4 mt-10">
          <div className="flex gap-4">
            <div className="bg-gray-200 h-14 w-14 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">
                {room.hotel.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-lg md:text-xl">Hosted by {room.hotel.name}</p>
              <div className="flex items-center mt-1">
                <StarRating />
                <p className="ml-2">200+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
