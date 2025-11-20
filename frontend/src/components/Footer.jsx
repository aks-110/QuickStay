import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="bg-[#E3F2FD] dark:bg-[#0A1A2F] text-gray-600 dark:text-gray-300 pt-14 px-6 md:px-16 lg:px-24 xl:px-32 transition-all">

      {/* Top Section */}
      <div className="flex flex-wrap justify-between gap-12 md:gap-10 lg:gap-20 max-w-[1400px] mx-auto">

        {/* Logo + About */}
        <div className="max-w-80">
          <img src={assets.logo} alt="logo" className="mb-4 h-9 cursor-pointer " />
          <p className="text-sm leading-relaxed">
            Discover the world's most extraordinary places to stay — from boutique hotels 
            to luxury villas and private islands.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-5">
            <img src={assets.instagramIcon} alt="instagram" className="w-6 hover:opacity-70 transition dark:invert cursor-pointer" />
            <img src={assets.facebookIcon} alt="facebook" className="w-6 hover:opacity-70 transition dark:invert cursor-pointer" />
            <img src={assets.twitterIcon} alt="twitter" className="w-6 hover:opacity-70 transition dark:invert cursor-pointer" />
            <img src={assets.linkendinIcon} alt="linkedin" className="w-6 hover:opacity-70 transition dark:invert cursor-pointer" />
          </div>
        </div>

        {/* Company Links */}
        <div>
          <p className="font-playfair text-lg text-gray-800 dark:text-white">COMPANY</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {["About", "Careers", "Press", "Blog", "Partners"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-black dark:hover:text-white transition cursor-pointer">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <p className="font-playfair text-lg text-gray-800 dark:text-white">SUPPORT</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {[
              "Help Center",
              "Safety Information",
              "Cancellation Options",
              "Contact Us",
              "Accessibility",
            ].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-black dark:hover:text-white transition cursor-pointer">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="max-w-80">
          <p className="font-playfair text-lg text-gray-800 dark:text-white">STAY UPDATED</p>
          <p className="mt-3 text-sm leading-relaxed">
            Subscribe to our newsletter for travel inspiration and exclusive offers.
          </p>

          <div className="flex items-center mt-5">
            <input
              type="text"
              className="bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 rounded-l-lg border border-gray-300 dark:border-gray-700 h-10 px-3 text-sm outline-none w-full"
              placeholder="Your email"
            />
            <button className="flex items-center justify-center bg-black dark:bg-white h-10 w-10 rounded-r-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition cursor-pointer">
              <img src={assets.arrowIcon} alt="arrow" className="w-4 invert dark:invert-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-300 dark:border-gray-700 mt-10" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-6 text-sm max-w-[1400px] mx-auto">
        <p>
          © {new Date().getFullYear()}{" "}
          <a href="#" className="hover:text-black dark:hover:text-white transition cursor-pointer">
            QuickStay
          </a>. All rights reserved.
        </p>

        <ul className="flex items-center gap-4">
          {["Privacy", "Terms", "Sitemap"].map((item) => (
            <li key={item}>
              <a href="#" className="hover:text-black dark:hover:text-white transition cursor-pointer">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Footer;
