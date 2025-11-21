//GET/api/user/

export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchCities = req.user.recentSearchCities;
    res.json({ success: true, role, recentSearchCities });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// store user recent searched cities

export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchCities } = req.body;
    const user = await req.user;

    if (user.recentSearchCities.length < 3) {
      user.recentSearchedCities.push(recentSearchCities);
    } else {
      user.recentSearchedCities.shift();
      user.recentSearchedCities.push(recentSearchCities);
    }
    await user.save();
    res.json({ success: true, message: "cities stored successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
