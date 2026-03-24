import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findById(userId);

    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);

        user = await User.create({
          _id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          username: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`
            : "User",
          image: clerkUser.imageUrl,
          role: "user",
        });

        console.log("User auto-synced to MongoDB:", user._id);
      } catch (syncError) {
        console.error("Auto-sync failed:", syncError);
        return res.json({
          success: false,
          message: "User sync failed. Please try logging in again.",
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.json({ success: false, message: error.message });
  }
};
