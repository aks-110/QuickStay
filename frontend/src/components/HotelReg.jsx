import React from "react";
import { assets, cities } from "../assets/assets";
import { motion } from "framer-motion";

const HotelReg = () => {
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex bg-white rounded-2xl max-w-4xl shadow-2xl overflow-hidden max-md:mx-2"
      >
        {/* Left Image */}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          src={assets.regImage}
          alt="reg-image"
          className="w-1/2 object-cover hidden md:block rounded-l-2xl"
        />

        {/* Right Section */}
        <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10">
          <img
            src={assets.closeIcon}
            alt="close-icon"
            className="absolute top-4 right-4 h-5 w-5 cursor-pointer hover:scale-110 transition-all"
          />

          <p className="text-3xl font-semibold mt-4 text-gray-800">
            Register Your Hotel
          </p>
          <p className="text-sm text-gray-500 mb-4 mt-1">
            Provide your hotel details to start receiving bookings.
          </p>

          {/* Hotel Name */}
          <div className="w-full mt-4">
            <label htmlFor="name" className="font-medium text-gray-600">
              Hotel Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Type here"
              className="border border-gray-300 rounded-lg w-full px-4 py-2.5 mt-1 outline-indigo-500 focus:ring-2 focus:ring-indigo-300 font-light shadow-sm"
              required
            />
          </div>

          {/* Phone */}
          <div className="w-full mt-4">
            <label htmlFor="contact" className="font-medium text-gray-600">
              Phone
            </label>
            <input
              id="contact"
              type="text"
              placeholder="Type here"
              className="border border-gray-300 rounded-lg w-full px-4 py-2.5 mt-1 outline-indigo-500 focus:ring-2 focus:ring-indigo-300 font-light shadow-sm"
              required
            />
          </div>

          {/* Address */}
          <div className="w-full mt-4">
            <label htmlFor="address" className="font-medium text-gray-600">
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Type here"
              className="border border-gray-300 rounded-lg w-full px-4 py-2.5 mt-1 outline-indigo-500 focus:ring-2 focus:ring-indigo-300 font-light shadow-sm"
              required
            />
          </div>

          {/* City Dropdown */}
          <div className="w-full mt-4 max-w-60 mr-auto">
            <label htmlFor="city" className="font-medium text-gray-600">
              City
            </label>
            <select
              id="city"
              className="border border-gray-300 rounded-lg w-full px-4 py-2.5 mt-1 outline-indigo-500 focus:ring-2 focus:ring-indigo-300 font-light shadow-sm"
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2.5 rounded-full cursor-pointer mt-6 shadow-md"
          >
            Register
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default HotelReg;
