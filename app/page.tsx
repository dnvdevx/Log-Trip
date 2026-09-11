"use client";

import { useState } from "react";
import Link from "next/link";

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  time: string;
  is_day: boolean;
}

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWeatherForLocation(location: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&timezone=auto`);
      if (!res.ok) 
        throw new Error("Failed to fetch weather data.");
      const data = await res.json();
      setWeather(data.current_weather);
      setOptions([]);
    } catch {
      setError("Could not load weather. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    setOptions([]);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
      if (!res.ok) 
        throw new Error("Geocoding request failed.");
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setError("No cities found with that name. Try a different spelling.");
      } else if (data.results.length === 1) {
        await fetchWeatherForLocation(data.results[0]);
      } else {
        setOptions(data.results);
      }
    } catch {
      setError("Something went wrong while searching. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search a City</h1>
      
      <div className="flex gap-2 mb-4">
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Enter a city" className="flex-1 px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none"/>
        <button onClick={handleSearch} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition">
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      
      {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

      {options.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-sm text-gray-400">Did you mean:</p>
          {options.map((opt, i) => (
            <button key={i} onClick={() => fetchWeatherForLocation(opt)} className="text-left px-4 py-2 border border-gray-700 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-white">
              <span className="font-medium">{opt.name}</span>
              {opt.admin1 ? `, ${opt.admin1}` : ""}
              <span className="text-gray-400"> : {opt.country}</span>
            </button>
          ))}
        </div>
      )}

      {weather && (
        <div className="mt-6 p-4 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Weather in {city}</h2>
          <p className="text-gray-300">Temperature: {weather.temperature}°C</p>
          <p className="text-gray-300">Wind Speed: {weather.windspeed} km/h</p>
          <p className="text-gray-300">Time: {weather.time.toString().slice(11, 16)}</p>
          <Link href={`/trips/new?city=${encodeURIComponent(city)}&temperature=${weather.temperature}&windspeed=${weather.windspeed}`}>
            <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">Log this trip</button>
          </Link>
        </div>
      )}
    </main>
  );
}