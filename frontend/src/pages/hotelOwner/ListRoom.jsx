import React, { useState, useEffect } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const { axios, getToken } = useAppContext();
  const [rooms, setRooms] = useState([]);

  // 1. Fetch Data
  const fetchOwnerRooms = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/rooms/owner", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      toast.error("Failed to fetch rooms");
    }
  };

  useEffect(() => {
    fetchOwnerRooms();
  }, [axios, getToken]);

  // 2. Handle Availability Toggle
  const toggleAvailability = async (roomId, index) => {
      try {
        const token = await getToken();
        const { data } = await axios.post("/api/rooms/toggle-availability", { roomId }, {
             headers: { authorization: `Bearer ${token}` },
        });
        if(data.success) {
             const updated = [...rooms];
             updated[index].isAvailable = !updated[index].isAvailable;
             setRooms(updated);
             toast.success(data.message);
        }
      } catch (error) {
          toast.error(error.message);
      }
  }

  // 3. ⭐ Handle Delete Room
  const handleRemoveRoom = async (roomId) => {
      if(!confirm("Are you sure you want to delete this room permanently? This cannot be undone.")) return;

      try {
          const token = await getToken();
          const { data } = await axios.post("/api/rooms/remove", { roomId }, {
              headers: { authorization: `Bearer ${token}` }
          });

          if(data.success) {
              toast.success(data.message);
              fetchOwnerRooms(); // Refresh the list
          } else {
              toast.error(data.message);
          }
      } catch (error) {
          toast.error(error.message);
      }
  }

  return (
    <div>
      <Title align="left" font="outfit" title="Room Listings" subtitle="Manage all listed rooms." />

      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-5xl mt-5">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">Image</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">Facility</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Price / night</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Availability</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rooms.map((item, index) => (
              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                
                {/* Image */}
                <td className="py-3 px-4">
                    <img src={item.images[0]} alt="" className="w-12 h-10 object-cover rounded" />
                </td>

                {/* Name */}
                <td className="py-3 px-4 text-gray-700">{item.roomType}</td>

                {/* Facilities */}
                <td className="py-3 px-4 text-gray-700 max-sm:hidden text-xs max-w-[200px] truncate">
                  {item.amenities.join(", ")}
                </td>

                {/* Price */}
                <td className="py-3 px-4 text-gray-700 text-center">₹ {item.pricePerNight}</td>

                {/* Availability Switch */}
                <td className="py-3 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.isAvailable}
                      onChange={() => toggleAvailability(item._id, index)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </td>

                {/* ⭐ Delete Button */}
                <td className="py-3 px-4 text-center">
                    <button 
                        onClick={() => handleRemoveRoom(item._id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                        title="Delete Room"
                    >
                        {/* Trash Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;