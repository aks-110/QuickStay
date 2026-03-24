import React, { useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddRoom = () => {
  const { axios, getToken } = useAppContext();

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
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
      !Object.values(images).some((img) => img)
    ) {
      toast.error("All fields and at least one image are required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", inputs.pricePerNight);

      const amenities = Object.keys(inputs.amenities).filter(
        (a) => inputs.amenities[a],
      );
      formData.append("amenities", JSON.stringify(amenities));

      Object.values(images).forEach((file) => {
        if (file) formData.append("images", file);
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
            "Free wifi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
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
    <div className="max-w-4xl mx-auto pb-12">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6"
      >
        <Title
          align="left"
          font="outfit"
          title="List a New Room"
          subtitle="Showcase your space with high-quality images and details."
        />

        <div className="mt-10">
          <p className="text-gray-800 font-semibold mb-3">
            Room Gallery (Up to 4 images)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.keys(images).map((key) => (
              <label
                key={key}
                htmlFor={`roomImage${key}`}
                className="cursor-pointer group"
              >
                <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex flex-col items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-300 transition-all">
                  {images[key] ? (
                    <img
                      src={URL.createObjectURL(images[key])}
                      alt="upload"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={assets.uploadArea || assets.addIcon}
                        alt="upload"
                        className="h-8 w-8 opacity-50 mb-2 group-hover:opacity-100 group-hover:scale-110 transition-all"
                      />
                      <span className="text-xs text-gray-500 font-medium">
                        Upload Image
                      </span>
                    </>
                  )}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <p className="text-gray-800 font-semibold mb-2">Room Type</p>
            <select
              value={inputs.roomType}
              onChange={(e) =>
                setInputs({ ...inputs, roomType: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
            >
              <option value="">Select Room Type</option>
              <option value="Single Bed">Single Bed</option>
              <option value="Double Bed">Double Bed</option>
              <option value="Luxury Room">Luxury Room</option>
              <option value="Family Suite">Family Suite</option>
            </select>
          </div>

          <div>
            <p className="text-gray-800 font-semibold mb-2">
              Price Per Night (₹)
            </p>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={inputs.pricePerNight}
              onChange={(e) =>
                setInputs({ ...inputs, pricePerNight: e.target.value })
              }
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
            />
          </div>
        </div>

        <div className="mt-8">
          <p className="text-gray-800 font-semibold mb-4">Included Amenities</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(inputs.amenities).map((amenity, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={inputs.amenities[amenity]}
                    onChange={() =>
                      setInputs({
                        ...inputs,
                        amenities: {
                          ...inputs.amenities,
                          [amenity]: !inputs.amenities[amenity],
                        },
                      })
                    }
                    className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  {amenity}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Publishing Room..." : "Publish Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
