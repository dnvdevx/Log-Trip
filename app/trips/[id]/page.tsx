"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function TripDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function loadTrip() {
      try {
        const response = await fetch(`/api/trips/${id}`);
        if (!response.ok) throw new Error("Trip not found.");
        const data = await response.json();
        setTrip(data);
        setTitle(data.title);
        setDescription(data.description || "");

        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        } else if (data.imageUrl) {
          setPhotos([data.imageUrl]);
        } else {
          setPhotos([]);
        }

        if (data.visitDate) {
          const d = new Date(data.visitDate);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          setVisitDate(d.toISOString().slice(0, 16));
        } else {
          setVisitDate("");
        }
      } catch {
        setError("Could not load this trip. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [id]);

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800;
          let { width, height } = img;
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) 
      return;

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImage(files[i]);
      newPhotos.push(compressed);
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDelete() {
    const confirmed = confirm("Delete this trip? This cannot be undone.");
    if (!confirmed) 
      return;
    const response = await fetch(`/api/trips/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/trips");
    } else {
      setError("Failed to delete trip. Please try again.");
    }
  }

  async function handleUpdate() {
    setError(null);
    const response = await fetch(`/api/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        visitDate: visitDate ? new Date(visitDate).toISOString() : undefined,
        imageUrl: photos[0] || undefined,
        photos: photos,
      }),
    });
    if (response.ok) {
      const updated = await response.json();
      setTrip(updated);
      setIsEditing(false);
    } else {
      setError("Failed to save changes. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-6 py-8">
        <p className="text-gray-400 animate-pulse">Loading trip...</p>
      </main>
    );
  }

  if (error && !trip) {
    return (
      <main className="max-w-lg mx-auto px-6 py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/trips" className="text-blue-400 hover:underline">&larr; Back to trips</Link>
      </main>
    );
  }

  const tripPhotos = (trip!.photos && trip!.photos.length > 0)
    ? trip!.photos
    : trip!.imageUrl ? [trip!.imageUrl] : [];

  return (
    <main className="max-w-lg mx-auto px-6 py-8">
      <Link href="/trips" className="text-sm text-blue-400 hover:underline mb-4 inline-block">&larr; Back to trips</Link>

      {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

      {!isEditing ? (
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-white">{trip!.title}</h1>
          <h2 className="text-gray-400">{trip!.city}{trip!.country ? `, ${trip!.country}` : ""}</h2>
          <p className="text-sm text-gray-400">Visited:{" "}
            {trip!.visitDate
              ? new Date(trip!.visitDate).toLocaleString()
              : "No date set"}
          </p>
          {trip!.temperature !== undefined && (
            <p className="text-sm text-gray-400">Weather when logged: {trip!.temperature}°C, {trip!.windspeed} km/h wind</p>
          )}
          {tripPhotos.length > 0 && (
            <div className={`mt-2 grid gap-2 ${tripPhotos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {tripPhotos.map((photo, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-700 bg-black">
                  <img src={photo} alt={`Photo ${i + 1}`} className={`w-full object-cover ${tripPhotos.length === 1 ? "max-h-80" : "h-40"}`}/>
                </div>
              ))}
            </div>
          )}

          {trip!.description && (
            <div className="mt-3 p-4 border border-gray-700 rounded-lg">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{trip!.description}</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition">
              Edit
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white mb-1">Edit Trip</h1>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white"/>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Visit Date &amp; Time</label>
            <input type="datetime-local" value={visitDate} onChange={(e) => setVisitDate(e.target.value)}className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white [color-scheme:dark]"/>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Pictures</label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-gray-700 h-24 bg-black">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs cursor-pointer" title="Remove">
                      &times;
                    </button>
                  </div>
                ))}
              </div> 
            )}
            <input type="file" accept="image/*" multiple onChange={handleAddPhotos}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-blue-400 hover:file:bg-gray-700 cursor-pointer"/>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description / Notes</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white"/>
          </div>

          <div className="flex gap-3">
            <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
              Save Changes
            </button>
            <button onClick={() => { setIsEditing(false); setError(null); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}