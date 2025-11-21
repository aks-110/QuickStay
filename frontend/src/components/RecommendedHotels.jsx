import React, { useContext, useEffect, useState } from "react";

import HotelCard from "./HotelCard";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const RecommendedHotels = () => {
  const { rooms, searchedCities } = useAppContext();

  const [recommended, setRecommended] = useState([]);

  const filterHotels = () => {
    const filteredHotels = rooms
      .slice()
      .filter((room) => searchedCities.includes(room.hotel.city));
    setRecommended(filteredHotels);
  };

  useEffect(() => {
    filterHotels();
  }, [rooms, searchedCities]);

  return (
    recommended.length > 0 && (
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
        <Title
          title="Recommended Hotels"
          subtitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
        />

        {/* Cards Section */}
        <div className="flex flex-wrap items-center justify-center gap-10 mt-20">
          {recommended.slice(0, 4).map((room, index) => (
            <div
              key={room._id}
              className="transform transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              <HotelCard room={room} index={index} />
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default RecommendedHotels;
