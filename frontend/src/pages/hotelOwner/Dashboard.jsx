import React, { useState, useEffect } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { axios, getToken } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookings: [],
  });

  const fetchDashboard = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setDashboardData({
          totalBookings: data.dashboardData.totalBookings,
          totalRevenue: data.dashboardData.totalRevenue,
          bookings: data.bookings,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [axios, getToken]);

  // ⭐ NEW: Handle Owner Cancel
  const handleOwnerCancel = async (bookingId) => {
    if(!confirm("Are you sure you want to cancel this guest's booking? Data will be erased.")) {
        return;
    }
    try {
        const token = await getToken();
        const { data } = await axios.post('/api/bookings/cancel', 
            { bookingId },
            { headers: { authorization: `Bearer ${token}` }}
        );

        if(data.success) {
            toast.success("Booking cancelled");
            fetchDashboard(); // Refresh data
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
  }

  return (
    <div className="pb-10">
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subtitle="Monitor your listings."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        <div className="bg-white shadow-md border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <img src={assets.totalBookingIcon} alt="" className="h-12" />
          <div>
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-blue-600 text-2xl font-semibold">
              {dashboardData.totalBookings}
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <img src={assets.totalRevenueIcon} alt="" className="h-12" />
          <div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-blue-600 text-2xl font-semibold">
              ₹ {dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Recent Bookings
      </h2>
      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-5xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">User Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Room Name
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Total Amount
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Payment Status
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dashboardData.bookings.map((item, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-3 px-4 text-gray-700">
                  {item.user.username}
                </td>
                <td className="py-3 px-4 text-gray-700 max-sm:hidden">
                  {item.room.roomType}
                </td>
                <td className="py-3 px-4 text-gray-700 text-center">
                  ₹ {item.totalPrice}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`py-1 px-3 text-xs rounded-full font-medium ${
                      item.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.isPaid ? "Completed" : "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                    <button 
                        onClick={() => handleOwnerCancel(item._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded border border-transparent hover:border-red-200 transition-all"
                    >
                        Cancel
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

export default Dashboard;