import React, { useState, useEffect } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { axios, getToken, setIsOwner, navigate } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookings: [],
  });

  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleOwnerCancel = async (bookingId) => {
    if (
      !confirm(
        "Are you sure you want to cancel this specific guest's booking? They will be refunded.",
      )
    )
      return;
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/bookings/cancel",
        { bookingId },
        { headers: { authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success("Booking cancelled and refunded.");
        fetchDashboard();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ⭐ MASS DELETION HANDLER
  const handleDeleteHotel = async () => {
    const confirmation = confirm(
      "DANGER: Are you absolutely sure?\n\nDeleting your property will:\n1. Delete all your listed rooms.\n2. Cancel ALL active guest bookings.\n3. Automatically REFUND all guests who paid online.\n4. Send cancellation emails to all booked guests.\n\nThis action CANNOT be undone!",
    );

    if (!confirmation) return;

    setIsDeleting(true);
    toast.loading("Processing mass refunds and deleting property...", {
      id: "deleteToast",
    });

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/hotels/remove",
        {},
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        toast.success(data.message, { id: "deleteToast" });
        setIsOwner(false);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(data.message, { id: "deleteToast" });
        setIsDeleting(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hotel", {
        id: "deleteToast",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <Title
        align="left"
        font="outfit"
        title="Overview Dashboard"
        subtitle="Monitor your property performance and recent bookings at a glance."
      />

      {/* Modern Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium mb-1">Total Bookings</p>
            <p className="text-gray-800 text-4xl font-bold tracking-tight">
              {dashboardData.totalBookings}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-full">
            <img
              src={assets.totalBookingIcon}
              alt=""
              className="h-8 w-8 opacity-80"
            />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium mb-1">Total Revenue</p>
            <p className="text-gray-800 text-4xl font-bold tracking-tight">
              ₹{dashboardData.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-full">
            <img
              src={assets.totalRevenueIcon}
              alt=""
              className="h-8 w-8 opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Guest Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Guest Bookings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Guest Name</th>
                <th className="py-4 px-6 font-medium max-sm:hidden">
                  Room Type
                </th>
                <th className="py-4 px-6 font-medium">Amount</th>
                <th className="py-4 px-6 font-medium text-center">Status</th>
                <th className="py-4 px-6 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {dashboardData.bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                dashboardData.bookings.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-800 font-medium">
                      {item.user?.username || "Guest"}
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-sm:hidden">
                      {item.room?.roomType || "Room"}
                    </td>
                    <td className="py-4 px-6 text-gray-800 font-medium">
                      ₹{item.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`py-1.5 px-3 text-xs rounded-full font-medium ${item.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {item.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOwnerCancel(item._id)}
                        className="text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-colors font-medium text-xs"
                      >
                        Cancel & Refund
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⭐ DANGER ZONE ⭐ */}
      <div className="mt-12 border border-red-200 rounded-2xl bg-red-50/50 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Danger Zone: Delete Property
            </h3>
            <p className="text-sm text-red-800 max-w-xl leading-relaxed">
              Once you delete your hotel, there is no going back. This will
              permanently erase your property, cancel all active bookings,
              automatically refund your guests, and send them a cancellation
              notice.
            </p>
          </div>
          <button
            onClick={handleDeleteHotel}
            disabled={isDeleting}
            className={`bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md whitespace-nowrap ${isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 active:scale-95"}`}
          >
            {isDeleting ? "Deleting..." : "Delete Hotel Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
