import React, { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, axios, getToken, setIsOwner, fetchUser } =
    useAppContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // New Phone States for Country Code
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Global City Search States
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Common Global Country Codes
  const countryCodes = [
    { code: "+91", country: "IN" },
    { code: "+1", country: "US/CA" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "AU" },
    { code: "+971", country: "UAE" },
    { code: "+49", country: "DE" },
    { code: "+33", country: "FR" },
    { code: "+81", country: "JP" },
    { code: "+86", country: "CN" },
    { code: "+65", country: "SG" },
    { code: "+92", country: "PK" },
    { code: "+880", country: "BD" },
    { code: "+94", country: "LK" },
    { code: "+977", country: "NP" },
  ];

  // Close city dropdown logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Cities API (OpenStreetMap)
  useEffect(() => {
    const fetchCities = async () => {
      if (city.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${city}&format=json&featuretype=city&limit=5`,
        );
        const data = await response.json();
        const uniqueCities = data.map((place) =>
          place.display_name.split(",")[0].trim(),
        );
        setSuggestions([...new Set(uniqueCities)]);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching cities");
      }
    };
    const delayDebounceFn = setTimeout(() => fetchCities(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [city]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const token = await getToken();

      // Merge Country Code and Phone Number
      const contact = `${countryCode} ${phoneNumber}`;

      const { data } = await axios.post(
        `/api/hotels`,
        { name, contact, address, city },
        { headers: { authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success(data.message);
        setIsOwner(true);
        await fetchUser();
        setShowHotelReg(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div
      onClick={() => setShowHotelReg(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex bg-white rounded-2xl max-w-4xl shadow-2xl overflow-hidden max-md:mx-2 w-full"
      >
        {/* Left Side Image */}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          src={assets.regImage}
          alt="reg-image"
          className="w-1/2 object-cover hidden md:block rounded-l-2xl"
        />

        {/* Right Side Form */}
        <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10 w-full">
          <img
            src={assets.closeIcon}
            alt="close"
            className="absolute top-4 right-4 h-5 w-5 cursor-pointer hover:scale-110 transition-all opacity-60"
            onClick={() => setShowHotelReg(false)}
          />

          <p className="text-3xl font-semibold mt-4 text-gray-800 text-center w-full">
            List Your Property
          </p>
          <p className="text-sm text-gray-500 mb-6 mt-1 text-center w-full">
            Provide global details to start receiving bookings.
          </p>

          {/* Hotel Name */}
          <div className="w-full mt-2">
            <label className="font-medium text-gray-600 text-sm">
              Hotel Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="The Grand Plaza"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 mt-1 outline-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50"
              required
            />
          </div>

          {/*  Global Phone Contact with Country Code  */}
          <div className="w-full mt-4">
            <label className="font-medium text-gray-600 text-sm">
              Phone Contact
            </label>
            <div className="flex gap-2 mt-1">
              {/* Country Code Dropdown */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 outline-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 w-28 cursor-pointer text-sm"
              >
                {countryCodes.map((c, i) => (
                  <option key={i} value={c.code}>
                    {c.country} ({c.code})
                  </option>
                ))}
              </select>

              {/* Phone Number Input */}
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                placeholder="12345 67890"
                className="border border-gray-300 rounded-lg w-full px-4 py-2 outline-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 text-sm"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="w-full mt-4">
            <label className="font-medium text-gray-600 text-sm">
              Exact Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              type="text"
              placeholder="123 Ocean Drive, Suite 4B"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 mt-1 outline-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50"
              required
            />
          </div>

          {/* Dynamic City Input */}
          <div className="w-full mt-4 relative" ref={dropdownRef}>
            <label className="font-medium text-gray-600 text-sm">
              City (Global Search)
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => city.length >= 3 && setShowDropdown(true)}
              type="text"
              placeholder="Search your city..."
              className="border border-gray-300 rounded-lg w-full px-4 py-2 mt-1 outline-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50"
              required
              autoComplete="off"
            />
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setCity(s);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-black hover:bg-gray-800 transition-all text-white w-full py-3 rounded-lg cursor-pointer mt-8 shadow-lg font-medium"
          >
            Register Property
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default HotelReg;
