import React, { useState, useEffect } from "react";
import { assets, facilityIcons } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";

const CheckBox = ({ label, selected, onChange }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-[15px] text-gray-600">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(label)} // Pass label back
        className="accent-black w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
};

const RadioButton = ({ label, selected, onChange }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-[15px] text-gray-600">
      <input
        type="radio"
        name="sortOptions"
        checked={selected}
        onChange={() => onChange(label)}
        className="accent-black w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
};

const Allrooms = () => {
  const navigate = useNavigate();
  const { axios } = useAppContext();
  
  // UI State
  const [openFilters, setOpenFilters] = useState(false);

  // Data State
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Filter States
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [sortOption, setSortOption] = useState("");

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priceRanges = ["0–500", "500–1000", "1000–2000", "2000–3000"];
  const sortOptions = ["Price Low → High", "Price High → Low", "Newest First"];

  // Fetch Data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get("/api/rooms");
        if (data.success) {
          setRooms(data.rooms);
          setFilteredRooms(data.rooms); // Initialize filtered list
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchRooms();
  }, [axios]);

  // Filter Logic
  useEffect(() => {
    let result = [...rooms];

    // 1. Filter by Room Type
    if (selectedRoomTypes.length > 0) {
      result = result.filter((room) => selectedRoomTypes.includes(room.roomType));
    }

    // 2. Filter by Price Range
    if (selectedPriceRanges.length > 0) {
      result = result.filter((room) => {
        return selectedPriceRanges.some((range) => {
          // Split "500–1000" into [500, 1000]
          const [min, max] = range.split("–").map(Number);
          return room.pricePerNight >= min && room.pricePerNight <= max;
        });
      });
    }

    // 3. Sort
    if (sortOption === "Price Low → High") {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortOption === "Price High → Low") {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortOption === "Newest First") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredRooms(result);
  }, [rooms, selectedRoomTypes, selectedPriceRanges, sortOption]);

  // Handlers
  const toggleRoomType = (type) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const togglePriceRange = (range) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range)
        ? prev.filter((r) => r !== range)
        : [...prev, range]
    );
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-32 px-5 md:px-16 lg:px-24 xl:px-32 bg-[#F8FAFC]">
      
      {/* LEFT SIDE - ROOM LIST */}
      <div className="w-full">
        <div className="flex flex-col text-left mb-10">
          <h1 className="font-playfair text-4xl md:text-[42px] font-bold text-gray-900">
            Explore Luxury Rooms
          </h1>
          <p className="text-gray-600 mt-2 text-[15px] max-w-xl leading-relaxed">
            Browse handpicked luxury hotels crafted to give you the perfect comfort.
          </p>
        </div>

        {/* Render Filtered Rooms */}
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              className="flex flex-col md:flex-row gap-6 p-5 mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="md:w-1/2">
                <img
                  onClick={() => navigate(`/rooms/${room._id}`)}
                  src={room.images[0]}
                  alt="hotel-img"
                  className="h-64 w-full rounded-xl object-cover shadow-md"
                />
              </div>

              <div className="flex flex-col justify-between w-full">
                <div>
                  <p className="text-xs text-gray-500">{room.hotel.city}</p>
                  <p className="text-2xl font-semibold mt-1">{room.hotel.name}</p>
                  <div className="flex items-center mt-2">
                    <StarRating />
                    <span className="ml-2 text-gray-600 text-sm">
                      200+ reviews
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 mt-3 text-sm">
                    <img src={assets.locationIcon} alt="location" className="w-4" />
                    <span>{room.hotel.address}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {room.amenities.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
                      >
                        <img
                          src={facilityIcons[item] || assets.starIconFilled}
                          alt={item}
                          className="w-4 h-4"
                        />
                        <p className="text-[12px]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{room.pricePerNight}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      / night
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No rooms match your filters.</p>
            <button 
              onClick={() => {
                setSelectedRoomTypes([]);
                setSelectedPriceRanges([]);
                setSortOption("");
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE - FILTERS */}
      <div className="bg-white w-full lg:w-80 border border-gray-200 rounded-2xl shadow-sm p-5 lg:sticky top-32 max-lg:mb-10">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-semibold text-gray-800 text-lg">Filters</h3>
          <p
            className="text-xs cursor-pointer lg:hidden text-gray-600"
            onClick={() => setOpenFilters(!openFilters)}
          >
            {openFilters ? "HIDE" : "SHOW"}
          </p>
        </div>

        <div className={`${openFilters ? "block" : "hidden lg:block"}`}>
          
          {/* Room Type Filter */}
          <div className="mt-6">
            <p className="font-medium text-gray-800 mb-2">Room Type</p>
            {roomTypes.map((item, index) => (
              <CheckBox 
                key={index} 
                label={item} 
                selected={selectedRoomTypes.includes(item)}
                onChange={toggleRoomType}
              />
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mt-6">
            <p className="font-medium text-gray-800 mb-2">Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox 
                key={index} 
                label={range} 
                selected={selectedPriceRanges.includes(range)}
                onChange={togglePriceRange}
              />
            ))}
          </div>

          {/* Sort Options */}
          <div className="mt-6">
            <p className="font-medium text-gray-800 mb-2">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton 
                key={index} 
                label={option} 
                selected={sortOption === option}
                onChange={setSortOption}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Allrooms;