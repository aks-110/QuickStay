import axios from "axios";
import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        setRooms(data.rooms);
      }
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
    currency,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);