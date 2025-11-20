import React, { useState } from "react";
import Title from "../components/Title";
import { assets, userBookingsDummyData } from "../assets/assets";

const MyBookings = () => {
  const [bookings, setBookings] = useState(userBookingsDummyData);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen">
      <Title
        title="My Bookings"
        subtitle="Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks."
        align="left"
      />

      <div className="max-w-6xl mt-10 w-full text-gray-800 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        {/* Header */}
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
            {/* Hotel Details */}
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
                  <img src={assets.locationIcon} alt="location-icon" className="w-4" />
                  <span>{booking.hotel.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <img src={assets.guestsIcon} alt="guests-icon" className="w-4" />
                  <span>Guests: {booking.guests}</span>
                </div>

                <p className="text-base font-semibold text-gray-900">
                  Total: <span className="text-indigo-600">₹{booking.totalPrice}</span>
                </p>
              </div>
            </div>

            {/* Dates */}
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

            {/* Payment */}
            <div className="flex flex-col items-start justify-center mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    booking.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <p
                  className={`text-sm font-medium ${
                    booking.isPaid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {booking.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>

              {!booking.isPaid && (
                <button className="px-5 py-2 mt-4 text-xs font-medium border border-gray-400 rounded-full hover:bg-gray-100 transition-all cursor-pointer shadow-sm">
                  Pay Now
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
