# Trip Weather Log

A full-stack web application where you can search any city, check its live weather, and save it as a trip log with your notes, visit date & time, and pictures.

## Features

- **Weather Search**: Search any city or place using the Open-Meteo API to get real-time temperature and wind speed.
- **Trip Logbook**: Save trips with title, visit date and time, description/notes, and photos.
- **Multiple Photos**: Upload one or multiple pictures for each trip (automatically resized so it saves fast).
- **CRUD Operations**: View all your trips, see details for a trip, edit trip information, or delete trips.
- **User Authentication**: Sign up and login system using JWT tokens and bcrypt password hashing. Each user sees their own logged trips.

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Route Handlers
- **Database**: MongoDB Atlas with Mongoose
- **Language**: TypeScript
- **External API**: Open-Meteo (Weather & Geocoding API)
- **Auth**: JWT (stored in httpOnly cookie) & bcryptjs

## Getting Started

1. Clone or download the repository.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

