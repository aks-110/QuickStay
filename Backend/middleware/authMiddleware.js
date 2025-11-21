import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Get the User ID from Clerk
    const { userId } = req.auth();

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    // 2. Check if user exists in MongoDB
    let user = await User.findById(userId);

    // 3. AUTO-SYNC: If user is missing in MongoDB, create them now
    if (!user) {
      try {
        // Fetch user details directly from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        // Create the user in MongoDB
        user = await User.create({
          _id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          username: clerkUser.firstName 
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}` 
            : "User",
          image: clerkUser.imageUrl,
          role: "user", // Default role
        });

        console.log("User auto-synced to MongoDB:", user._id);
      } catch (syncError) {
        console.error("Auto-sync failed:", syncError);
        return res.json({ success: false, message: "User sync failed. Please try logging in again." });
      }
    }

    // 4. Attach user to request and proceed
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.json({ success: false, message: error.message });
  }
};