import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Allrooms from "./pages/Allrooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

function App() {
  const location = useLocation();
  // Check if the current path contains "owner"
  const isOwnerPath = location.pathname.includes("owner");

  const { showHotelReg } = useAppContext();

  return (
    <div className="relative">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Hide Main Navbar on Dashboard */}
      {!isOwnerPath && <Navbar />}
      
      {/* Registration Modal */}
      {showHotelReg && <HotelReg />}

      <div className="min-h-[70vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Allrooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* Owner/Dashboard Routes */}
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </div>

      {/* Hide Main Footer on Dashboard */}
      {!isOwnerPath && <Footer />}
    </div>
  );
}

export default App;