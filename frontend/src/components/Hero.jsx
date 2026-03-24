import React, { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

function Hero() {
  const { navigate, getToken, axios, setSearchedCities, t } = useAppContext();

  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&featuretype=city&limit=5`,
        );
        const data = await response.json();
        const uniqueCities = data.map((place) => {
          const parts = place.display_name.split(",");
          return `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
        });
        setSuggestions([...new Set(uniqueCities)]);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching cities");
      } finally {
        setIsSearching(false);
      }
    };
    const delayDebounceFn = setTimeout(() => fetchCities(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectCity = (city) => {
    setQuery(city);
    setDestination(city);
    setShowDropdown(false);
  };

  const onSearch = async (e) => {
    e.preventDefault();

    const finalSearch = destination || query;
    if (!finalSearch.trim()) return;

    const searchCity = finalSearch.split(",")[0].trim();
    navigate(`/rooms?destination=${searchCity}`);

    try {
      const token = await getToken();
      if (token) {
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchedCity: searchCity },
          { headers: { authorization: `Bearer ${token}` } },
        );
      }
      setSearchedCities((prev) => {
        const updated = [...prev, searchCity];
        if (updated.length > 3) return updated.slice(-3);
        return updated;
      });
    } catch (error) {
      console.error("Search Error", error);
    }
  };

  return (
    <div className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center h-screen relative'>
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full mt-16">
        <p className="inline-block bg-[#49B9FF]/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
          The Ultimate Hotel Experience
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl lg:text-[64px] lg:leading-[70px] font-bold max-w-2xl mt-4 drop-shadow-lg">
          Discover Your Perfect Global Getaway
        </h1>

        <form
          onSubmit={onSearch}
          className="bg-white text-gray-700 rounded-2xl shadow-2xl p-4 mt-8 flex flex-col md:flex-row max-md:items-start items-end gap-4 max-w-5xl"
        >
          <div className="relative flex-1 w-full" ref={dropdownRef}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-600">
              <img
                src={assets.locationIcon}
                alt=""
                className="h-4 opacity-70"
              />{" "}
              Destination
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDestination("");
              }}
              onFocus={() => query.length >= 3 && setShowDropdown(true)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder={t("searchGlobally")}
              required
              autoComplete="off"
            />
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <li className="px-4 py-3 text-sm text-gray-500">
                    Searching...
                  </li>
                ) : (
                  suggestions.map((city, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectCity(city)}
                      className="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none flex items-center gap-2"
                    >
                      {city}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="flex-1 w-full md:max-w-40">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-600">
              Check in
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none text-gray-500"
            />
          </div>

          <div className="flex-1 w-full md:max-w-40">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-600">
              Check out
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 px-8 text-white font-medium transition-all cursor-pointer"
          >
            <img
              src={assets.searchIcon}
              alt="searchIcon"
              className="h-5 invert"
            />
            <span className="md:hidden lg:block">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Hero;
