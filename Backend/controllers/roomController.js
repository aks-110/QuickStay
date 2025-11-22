import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const { userId } = req.auth;
    
    const hotel = await Hotel.findOne({ owner: userId });

    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found. Please register first." });
    }

    if (!req.files || req.files.length === 0) {
        return res.json({ success: false, message: "Please upload at least one image" });
    }

    // Upload images
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: { path: "owner" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerRooms = async (req, res) => {
  try {
    const { userId } = req.auth;
    
    const hotelData = await Hotel.findOne({ owner: userId });

    if(!hotelData) {
         return res.json({ success: false, message: "No hotel found for this user" });
    }

    const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    
    if (!roomData) return res.json({ success: false, message: "Room not found" });

    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    res.json({ success: true, message: "Availability updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const removeRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
        const { userId } = req.auth; // Get owner ID from Clerk

        const room = await Room.findById(roomId).populate("hotel");

        if(!room) {
            return res.json({ success: false, message: "Room not found"});
        }

        // Security Check: Ensure the requester owns the hotel associated with the room
        if(room.hotel.owner.toString() !== userId) {
            return res.json({ success: false, message: "Not authorized to delete this room"});
        }

        await Room.findByIdAndDelete(roomId);

        res.json({ success: true, message: "Room deleted successfully"});

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}