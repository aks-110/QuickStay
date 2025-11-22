import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRoom,
  getOwnerRooms,
  getRooms,
  toggleRoomAvailability,
  removeRoom, // Import the new function
} from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.post("/", protect, upload.array("images", 4), createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);
roomRouter.post("/remove", protect, removeRoom);

export default roomRouter;