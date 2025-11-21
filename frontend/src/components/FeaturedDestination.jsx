import React, { useContext } from "react";

import HotelCard from "./HotelCard";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const FeaturedDestination = () => {
  const {rooms,navigate} = useAppContext();



  return rooms.length > 0 && (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
      
      <Title
        title="Featured Destination"
        subtitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
      />

      {/* Cards Section */}
      <div className="flex flex-wrap items-center justify-center gap-10 mt-20">
        {rooms.slice(0, 4).map((room, index) => (
          <div
            key={room._id}
            className="transform transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
          >
            <HotelCard room={room} index={index} />
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={() => {
          navigate("/rooms");
          scrollTo(0, 0);
        }}
        className="
          mt-16 px-6 py-2 text-sm font-medium rounded-lg
          border border-gray-300 bg-white 
          hover:border-black hover:bg-gray-100 
          transition-all shadow-sm
        "
      >
        View All Destinations
      </button>

    </div>
  );
};

export default FeaturedDestination;
