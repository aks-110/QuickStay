import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

  // ⭐ Multi-Currency & Language States
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("EN");

  // Simple Exchange Rates (Base INR)
  const exchangeRates = { INR: 1, USD: 83, EUR: 90 };
  const currencySymbols = { INR: "₹", USD: "$", EUR: "€" };

  const convertPrice = (priceInINR) => {
    const rate = exchangeRates[currency];
    return Math.round(priceInINR / rate);
  };

  // Simple Translations Dictionary
  const dict = {
    EN: {
      explore: "Explore Luxury Rooms",
      filters: "Filters",
      bookNow: "Book Now",
      checkIn: "Check-in",
      checkOut: "Check-out",
      searchGlobally: "Search globally (e.g. Paris, Tokyo)",
    },
    HI: {
      explore: "लक्ज़री कमरे खोजें",
      filters: "फिल्टर",
      bookNow: "अभी बुक करें",
      checkIn: "चेक-इन",
      checkOut: "चेक-आउट",
      searchGlobally: "दुनिया में कहीं भी खोजें...",
    },
  };
  const t = (key) => dict[language][key] || key;

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUser = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchUser();
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    fetchUser,
    openSignIn,
    rooms,
    setRooms,
    currency,
    setCurrency,
    currencySymbol: currencySymbols[currency],
    convertPrice,
    language,
    setLanguage,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
