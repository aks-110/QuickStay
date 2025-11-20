import React, { useState } from "react";
import Title from "../../components/Title";
import { assets, dashboardDummyData } from "../../assets/assets";

const Dashboard = () => {
  const [dashboardData] = useState(dashboardDummyData);

  return (
    <div className="pb-10">
      {/* Page Title */}
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subtitle="Monitor your room listings, track bookings, and analyze revenue—all in one place. Stay updated with real-time insights to ensure smooth operations."
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        {/* Card 1 */}
        <div className="bg-white shadow-md hover:shadow-lg transition-all border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <img src={assets.totalBookingIcon} alt="" className="h-12" />
          <div>
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-blue-600 text-2xl font-semibold">
              {dashboardData.totalBookings}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-md hover:shadow-lg transition-all border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <img src={assets.totalRevenueIcon} alt="" className="h-12" />
          <div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-blue-600 text-2xl font-semibold">
              ₹ {dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Recent Bookings
      </h2>

      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-4xl">
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
            </tr>
          </thead>

          <tbody className="text-sm">
            {dashboardData.bookings.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors border-t border-gray-200"
              >
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
