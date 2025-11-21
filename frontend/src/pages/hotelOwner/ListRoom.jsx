import React, { useState, useEffect } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const { axios, getToken } = useAppContext();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
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
    fetchOwnerRooms();
  }, [axios, getToken]);

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

  return (
    <div>
      <Title align="left" font="outfit" title="Room Listings" subtitle="Manage all listed rooms." />

      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-4xl mt-5">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">Facility</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Price / night</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Availability</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rooms.map((item, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-3 px-4 text-gray-700">{item.roomType}</td>
                <td className="py-3 px-4 text-gray-700 max-sm:hidden">{item.amenities.join(", ")}</td>
                <td className="py-3 px-4 text-gray-700 text-center">₹ {item.pricePerNight}</td>
                <td className="py-3 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.isAvailable}
                      onChange={() => toggleAvailability(item._id, index)}
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-6"></span>
                  </label>
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