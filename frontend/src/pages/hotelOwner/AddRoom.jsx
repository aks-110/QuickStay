import React, { useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddRoom = () => {
  const { axios, getToken } = useAppContext();

  const [images, setImages] = useState({
    1: null, 2: null, 3: null, 4: null,
  });

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: "",
    amenities: {
      "Free wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (
      !inputs.roomType ||
      !inputs.pricePerNight ||
      !Object.values(images).some((image) => image)
    ) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", inputs.pricePerNight);

      const amenities = Object.keys(inputs.amenities).filter(
        (amenity) => inputs.amenities[amenity]
      );
      formData.append("amenities", JSON.stringify(amenities));

      // CORRECTED LOOP
      Object.values(images).forEach((file) => {
        if (file) {
          formData.append("images", file);
        }
      });

      const { data } = await axios.post("/api/rooms/", formData, {
        headers: { authorization: `Bearer ${await getToken()}` },
      });
      
      if (data.success) {
        toast.success(data.message);
        setInputs({
          roomType: "",
          pricePerNight: "",
          amenities: {
            "Free wifi": false, "Free Breakfast": false, "Room Service": false, "Mountain View": false, "Pool Access": false,
          },
        });
        setImages({ 1: null, 2: null, 3: null, 4: null });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="pb-12" onSubmit={onSubmitHandler}>
      <Title align="left" font="outfit" title="Add Room" subtitle="Fill details carefully." />

      <p className="text-gray-800 mt-10 font-medium">Room Images</p>
      <div className="grid grid-cols-2 sm:flex gap-5 mt-3 flex-wrap">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`roomImage${key}`} className="cursor-pointer">
            <div className="w-32 h-32 border border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
                alt="upload"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              hidden
              onChange={(e) =>
                setImages((prev) => ({ ...prev, [key]: e.target.files[0] }))
              }
            />
          </label>
        ))}
      </div>

      <div className="flex max-sm:flex-col gap-6 mt-8 w-full">
        <div className="flex-1 min-w-[200px]">
          <p className="text-gray-800 font-medium mb-1">Room Type</p>
          <select
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full shadow-sm"
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div>
          <p className="text-gray-800 font-medium mb-1">₹ Price <span className="text-xs">/night</span></p>
          <input
            type="number"
            placeholder="0"
            value={inputs.pricePerNight}
            onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-28 shadow-sm"
          />
        </div>
      </div>

      <p className="text-gray-800 font-medium mt-8">Amenities</p>
      <div className="grid grid-cols-2 gap-3 mt-3 text-gray-700 max-w-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <label key={index} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] },
                })
              }
              className="h-4 w-4 accent-blue-600"
            />
            <span>{amenity}</span>
          </label>
        ))}
      </div>

      <button className="mt-10 bg-blue-600 text-white font-medium px-8 py-2 rounded-lg shadow-md">
        {loading ? "Adding Room..." : "Add Room"}
      </button>
    </form>
  );
};

export default AddRoom;