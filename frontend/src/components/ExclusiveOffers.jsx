import React from "react";
import Title from "./Title";
import { assets, exclusiveOffers } from "../assets/assets";

const ExclusiveOffers = () => {
  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-30">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <Title
          align="left"
          title="Exclusive Offers"
          subtitle="Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories."
        />

        <button className="group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12">
          View All Offers
          <img
            src={assets.arrowIcon}
            alt="arrow-icon"
            className="group-hover:translate-x-1 transition-all"
          />
        </button>
      </div>

      {/* Offers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full mt-12">
        {exclusiveOffers.map((item) => (
          <div
            key={item._id}
            className="
              group relative overflow-hidden rounded-2xl shadow-xl 
              hover:shadow-2xl cursor-pointer transform hover:-translate-y-1 
              transition-all duration-500
            "
          >
            {/* Background Image */}
            <div
              className="
                absolute inset-0 bg-cover bg-center 
                group-hover:scale-110 transition-all duration-700
              "
              style={{ backgroundImage: `url(${item.image})` }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />

            {/* Discount Tag */}
            <p className="absolute top-4 left-4 px-3 py-1 text-xs bg-white text-gray-800 font-medium rounded-full z-20">
              {item.priceOff}% OFF
            </p>

            {/* Content */}
            <div className="relative z-20 p-6 pt-20 flex flex-col justify-between h-full text-white">
              <div>
                <p className="text-2xl font-playfair font-semibold">
                  {item.title}
                </p>
                <p className="text-sm opacity-90">{item.description}</p>

                <p className="text-xs text-white/80 mt-3">
                  Expires {item.expiryDate}
                </p>
              </div>

              {/* View Button */}
              <button className="flex items-center gap-2 text-sm mt-6 font-medium">
                View Offer
                <img
                  className="invert group-hover:translate-x-1 transition-all"
                  src={assets.arrowIcon}
                  alt="arrow-icon"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
