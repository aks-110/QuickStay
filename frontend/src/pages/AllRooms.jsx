import React, { useState, useEffect } from "react";
import { assets, facilityIcons } from "../assets/assets.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";

const CheckBox = ({ label, selected, onChange }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-3 text-sm text-gray-600 hover:text-black transition-colors">
    <input
      type="checkbox"
      checked={selected}
      onChange={() => onChange(label)}
      className="accent-blue-600 w-4 h-4 rounded-sm border-gray-300 cursor-pointer"
    />
    <span>{label}</span>
  </label>
);

const Allrooms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { axios, currencySymbol, convertPrice, t } = useAppContext();

  const [openFilters, setOpenFilters] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filters
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [maxPrice, setMaxPrice] = useState(25000); // Slider state (in INR Base)
  const [sortOption, setSortOption] = useState("");

  const destination = searchParams.get("destination") || "";
  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const allAmenities = [
    "Free wifi",
    "Free Breakfast",
    "Room Service",
    "Mountain View",
    "Pool Access",
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/rooms");
        if (data.success) {
          setRooms(data.rooms);
          setFilteredRooms(data.rooms);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [axios]);

  useEffect(() => {
    let result = [...rooms];

    if (destination) {
      const destLower = destination.toLowerCase();
      result = result.filter(
        (r) =>
          r.hotel.city.toLowerCase().includes(destLower) ||
          r.hotel.address.toLowerCase().includes(destLower),
      );
    }

    if (selectedRoomTypes.length > 0)
      result = result.filter((r) => selectedRoomTypes.includes(r.roomType));

    // Amenities Logic: Must have ALL selected amenities
    if (selectedAmenities.length > 0) {
      result = result.filter((r) =>
        selectedAmenities.every((a) => r.amenities.includes(a)),
      );
    }

    // Slider Price Logic
    result = result.filter((r) => r.pricePerNight <= maxPrice);

    // Sorting Logic
    if (sortOption === "Low to High")
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sortOption === "High to Low")
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);

    setFilteredRooms(result);
  }, [
    rooms,
    selectedRoomTypes,
    selectedAmenities,
    maxPrice,
    sortOption,
    destination,
  ]);

  const toggleArrayItem = (setter) => (item) =>
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 px-5 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen gap-8">
      {/* ROOMS LIST */}
      <div className="w-full">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-[40px] font-bold text-gray-900">
            {destination ? `Stays in ${destination}` : t("explore")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {filteredRooms.length} properties found.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              onClick={() => navigate(`/rooms/${room._id}`)}
              className="group flex flex-col md:flex-row gap-6 p-5 mb-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="md:w-[40%] overflow-hidden rounded-xl">
                <img
                  src={room.images[0]}
                  alt="hotel"
                  className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex flex-col justify-between w-full md:w-[60%]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {room.hotel.city}
                  </p>
                  <p className="text-2xl font-semibold mt-1 text-gray-900">
                    {room.hotel.name}
                  </p>
                  <div className="flex items-center mt-2">
                    <StarRating />{" "}
                    <span className="ml-2 text-gray-500 text-sm">
                      200+ reviews
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {room.amenities.slice(0, 4).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-md"
                      >
                        <img
                          src={facilityIcons[item] || assets.starIconFilled}
                          alt={item}
                          className="w-3.5 h-3.5 opacity-70"
                        />
                        <p className="text-[11px] font-medium text-gray-600">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-end border-t border-gray-50 pt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {currencySymbol}
                    {convertPrice(room.pricePerNight)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      / night
                    </span>
                  </p>
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg font-medium text-gray-700">
              No rooms match your filters.
            </p>
            <button
              onClick={() => {
                setSelectedRoomTypes([]);
                setSelectedAmenities([]);
                setMaxPrice(25000);
                setSortOption("");
                navigate("/rooms");
              }}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ADVANCED SIDEBAR FILTERS */}
      <div className="bg-white w-full lg:w-80 border border-gray-200 rounded-2xl shadow-sm p-6 lg:sticky lg:top-28 z-10">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
          <h3 className="font-bold text-gray-900 text-lg">{t("filters")}</h3>
          <p
            className="text-xs font-semibold text-blue-600 cursor-pointer lg:hidden"
            onClick={() => setOpenFilters(!openFilters)}
          >
            {openFilters ? "HIDE" : "SHOW"}
          </p>
        </div>

        <div
          className={`${openFilters ? "block" : "hidden lg:block"} space-y-8`}
        >
          {/* Slider Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-gray-900">Max Price</p>
              <span className="text-sm font-bold text-blue-600">
                {currencySymbol}
                {convertPrice(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Types */}
          <div>
            <p className="font-semibold text-gray-900 mb-3">Room Type</p>
            {roomTypes.map((t) => (
              <CheckBox
                key={t}
                label={t}
                selected={selectedRoomTypes.includes(t)}
                onChange={toggleArrayItem(setSelectedRoomTypes)}
              />
            ))}
          </div>

          {/* Amenities Filter */}
          <div>
            <p className="font-semibold text-gray-900 mb-3">Amenities</p>
            {allAmenities.map((a) => (
              <CheckBox
                key={a}
                label={a}
                selected={selectedAmenities.includes(a)}
                onChange={toggleArrayItem(setSelectedAmenities)}
              />
            ))}
          </div>

          {/* Sort */}
          <div>
            <p className="font-semibold text-gray-900 mb-3">Sort Order</p>
            <select
              onChange={(e) => setSortOption(e.target.value)}
              value={sortOption}
              className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm font-medium"
            >
              <option value="">Recommended</option>
              <option value="Low to High">Price: Low to High</option>
              <option value="High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allrooms;
