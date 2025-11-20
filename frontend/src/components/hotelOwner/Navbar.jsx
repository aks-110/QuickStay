import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-3 bg-white border-b border-gray-200 shadow-sm">
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className="h-9 opacity-90 hover:opacity-100 transition invert"
        />
      </Link>

      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
