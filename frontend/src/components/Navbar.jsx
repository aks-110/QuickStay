import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const BookIcon = () => (
  <img
    src={assets.totalBookingIcon}
    alt="bookings"
    style={{
      width: "18px",
      height: "18px",
      filter: "brightness(0) saturate(100%)",
    }}
  />
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSignIn } = useClerk();
  const location = useLocation();
  const {
    user,
    navigate,
    isOwner,
    setShowHotelReg,
    language,
    setLanguage,
    currency,
    setCurrency,
  } = useAppContext();

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/90 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4" : "py-4 md:py-6"}`}
    >
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className={`h-9 ${isScrolled ? "invert opacity-80" : ""}`}
        />
      </Link>

      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"}`}
          >
            {link.name}
            <div
              className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </Link>
        ))}
        {user && (
          <button
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all ${isScrolled ? "text-black border-black" : "text-white border-white"}`}
            onClick={() =>
              isOwner ? navigate("/owner") : setShowHotelReg(true)
            }
          >
            {isOwner ? "Dashboard" : "List Your Hotel"}
          </button>
        )}
      </div>

      <div className="hidden md:flex items-center gap-4">
        {/* Language Selector */}
        <select
          onChange={(e) => setLanguage(e.target.value)}
          value={language}
          className={`bg-transparent text-sm outline-none cursor-pointer font-medium ${isScrolled ? "text-gray-700" : "text-white"}`}
        >
          <option value="EN" className="text-black">
            EN
          </option>
          <option value="HI" className="text-black">
            HI
          </option>
        </select>

        {/* Currency Selector */}
        <select
          onChange={(e) => setCurrency(e.target.value)}
          value={currency}
          className={`bg-transparent text-sm outline-none cursor-pointer font-medium border-r pr-3 border-gray-300 ${isScrolled ? "text-gray-700" : "text-white"}`}
        >
          <option value="INR" className="text-black">
            ₹ INR
          </option>
          <option value="USD" className="text-black">
            $ USD
          </option>
          <option value="EUR" className="text-black">
            € EUR
          </option>
        </select>

        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full ml-2 transition-all cursor-pointer font-medium text-sm"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle (Simplified for brevity) */}
      <div className="flex items-center gap-3 md:hidden">
        <button onClick={() => setIsMenuOpen(true)}>
          <img
            src={assets.menuIcon}
            alt="menu"
            className={`h-6 ${isScrolled ? "invert" : ""}`}
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
