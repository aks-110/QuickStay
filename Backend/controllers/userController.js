import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities;
    res.json({ success: true, role, recentSearchedCities });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body; // Fixed variable name match
    const user = req.user;

    if (!user.recentSearchedCities.includes(recentSearchedCity)) {
      user.recentSearchedCities.push(recentSearchedCity);
      
      // Limit to 3
      if (user.recentSearchedCities.length > 3) {
        user.recentSearchedCities.shift();
      }
      
      await user.save();
    }
    
    res.json({ success: true, message: "City stored successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};