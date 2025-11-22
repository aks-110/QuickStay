QuickStay - Luxury Hotel Booking Platform 🏨
QuickStay is a full-stack web application that allows users to discover luxury hotels, filter rooms by amenities, and book stays securely. It features a robust dashboard for hotel owners to manage their properties, track revenue, and handle real-time availability.
🌟 Features
👤 For Travelers (Users)
Authentication: Secure login/signup via Clerk (Email/Google).
Search & Filter: Filter rooms by price, type, and amenities.
Visuals: View high-quality room images and reviews.
Secure Payments: Integrated Stripe Checkout for instant booking payments.
Booking History: View past/upcoming bookings and payment status.
Cancellations: Ability to cancel bookings with automated database updates.
Email Alerts: Receive automated booking confirmation emails.
🏨 For Hotel Owners
Property Management: Register hotels and add rooms with image uploads.
Dashboard: Real-time analytics for Total Revenue and Bookings.
Availability Control: Toggle room availability instantly.
Room Management: Add or Delete rooms from the listing.
Admin Controls: Cancel guest bookings if necessary.
📂 Project Structure
QuickStay/
├── backend/
│   ├── configs/
│   │   ├── cloudinary.js    # Image Storage Config
│   │   ├── db.js            # MongoDB Connection
│   │   └── nodemailer.js    # Email Config
│   ├── controllers/
│   │   ├── bookingController.js # Payment & Booking Logic
│   │   ├── roomController.js    # Room Management
│   │   └── ...
│   ├── middleware/          # Auth & File Upload
│   ├── models/              # Mongoose Schemas (User, Room, Booking)
│   ├── routes/              # API Routes
│   ├── .env                 # Backend Environment Variables
│   └── server.js            # Entry Point
│
└── frontend/
    ├── src/
    │   ├── assets/          # Images & Icons
    │   ├── components/      # UI Components (Navbar, Cards)
    │   ├── context/         # AppContext (Global State)
    │   ├── pages/           # Home, RoomDetails, Dashboard
    │   ├── App.jsx          # Routing
    │   └── main.jsx         # Provider Wrappers
    └── .env                 # Frontend Environment Variables


🛠️ Tech Stack
Frontend: React.js (Vite), Tailwind CSS, Framer Motion
Backend: Node.js, Express.js
Database: MongoDB (Mongoose)
Auth: Clerk
Payments: Stripe
Storage: Cloudinary
Email: Nodemailer (SMTP)
🚀 Complete Setup Guide
Follow these steps to run the project locally from scratch.
Step 1: Prerequisites
Ensure you have the following accounts/tools:
Node.js (v16+) installed.
MongoDB Atlas URL.
Clerk API Keys (Publishable & Secret).
Stripe API Keys (Publishable & Secret).
Cloudinary API Keys (Name, Key, Secret).
SMTP Server (e.g., Brevo) for emails.
Step 2: Backend Configuration
Navigate to backend:
cd backend
npm install


Create Environment File:
Create a file named .env inside the backend/ folder and paste this:
PORT=3000
DB_URL=mongodb+srv://<your-mongo-url>

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Nodemailer (SMTP)
SENDER_EMAIL=your-verified-email@example.com
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...


Start Backend:
npm run dev

Output should say: "Server running on port 3000" & "Connected to MongoDB".
Step 3: Frontend Configuration
Open a new terminal and navigate to frontend:
cd frontend
npm install


Create Environment File:
Create a file named .env inside the frontend/ folder:
# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# API Connection (No trailing slash)
VITE_BACKEND_URL=http://localhost:3000

# Settings
VITE_CURRENCY=$


Start Frontend:
npm run dev
