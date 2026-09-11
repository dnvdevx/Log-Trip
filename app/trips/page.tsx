"use client"
import Link from "next/link"
import { useEffect, useState } from "react";

interface Trip {
  _id: string;
  city: string;
  country?: string;
  title: string;
  description?: string;
  visitDate?: string;
  temperature?: number;
  windspeed?: number;
  imageUrl?: string;
  photos?: string[];
  createdAt: string;
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        const response = await fetch(`/api/trips`);
        if (!response.ok) 
          throw new Error("Failed to load trips.");
        const data = await response.json();
        setTrips(data);
      } catch {
        setError("Could not load logbook. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">My Trips</h1>

      {loading && (
        <p className="text-gray-400 animate-pulse">Loading trips...</p>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && trips.length === 0 && (
        <p className="text-gray-400">No trips logged yet. Search a city to get started.</p>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <Link href={`/trips/${trip._id}`} key={trip._id} className="block border border-gray-700 rounded-lg hover:bg-gray-800 transition overflow-hidden">
              {(trip.imageUrl || (trip.photos && trip.photos.length > 0)) && (
                <div className="h-40 w-full overflow-hidden bg-black relative">
                  <img src={trip.imageUrl || (trip.photos && trip.photos[0])} alt={trip.title} className="w-full h-full object-cover"/>
                  {trip.photos && trip.photos.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded-md">+{trip.photos.length - 1} more</span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">{trip.title}</h3>
                <p className="text-gray-400 text-sm mb-1">{trip.city}{trip.country ? `, ${trip.country}` : ""}</p>
                <p className="text-sm text-gray-300">Temperature: {trip.temperature}°C | Wind: {trip.windspeed} km/h</p>
                <p className="text-sm text-gray-500 mt-2">{trip.visitDate? new Date(trip.visitDate).toLocaleString(): "No visit date"}</p>
                {trip.description && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{trip.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}