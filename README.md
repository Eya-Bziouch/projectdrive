# Carpooling Application

A comprehensive carpooling solution designed to connect drivers and passengers for shared rides. This project consists of a Node.js/Express backend and a React Native (Expo) mobile application.

## 🚀 Tech Stack

### Backend
- **Framework:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens) & Bcryptjs
- **File Handling:** Multer (for image uploads)
- **Other:** CORS, Dotenv

### Frontend (Mobile)
- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **HTTP Client:** Axios
- **Storage:** Async Storage
- **Media:** Expo Image Picker, Expo AV, Expo Video

## 📂 Project Structure

```
/
├── backend/         # Express API Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── uploads/     # Helper directory for file uploads
│
└── mobile/          # Expo React Native App
    ├── app/
    ├── src/
    │   ├── components/
    │   ├── screens/
    │   ├── navigation/
    │   └── context/
    └── package.json
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)
- Expo Go (on mobile) or Android/iOS Emulator

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory (if not already present) with the following standard keys:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm start
# OR for development
npm run dev
```

The server will run on `http://localhost:5000` (or the port you specified).

### 2. Mobile App Setup

Navigate to the mobile directory and install dependencies:

```bash
cd mobile
npm install
```

**Configuration:**
Ensure your mobile app is pointing to the correct backend IP address. Check `mobile/src/utils/config.js` or `constants.js` (depending on your specific structure) to update the `API_URL` to your machine's local IP address (e.g., `http://192.168.1.XX:5000`).

Start the Expo development server:

```bash
npx expo start
```

- Scan the QR code with **Expo Go** (Android/iOS).
- Press `a` to open in an **Android Emulator**.
- Press `i` to open in an **iOS Simulator**.

## ✨ Features

- **User Authentication:** Secure Login and Signup flows.
- **Ride Management:**
  - **Drivers:** Create and manage ride offers.
  - **Passengers:** Search for rides and book seats.
- **Ride Lifecycle:**
  - Cancel rides (Drivers).
  - Leave rides (Passengers).
  - History of hosted and joined rides.
- **Media Chat:**
  - Send messages, images, and videos.
- **Profile:** User profiles with uploaded avatars.

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.
