"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function NewTripForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const city = searchParams.get("city") || "";
  const temperature = searchParams.get("temperature");
  const windspeed = searchParams.get("windspeed");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          title,
          description,
          visitDate: visitDate ? new Date(visitDate).toISOString() : undefined,
          temperature: temperature ? Number(temperature) : undefined,
          windspeed: windspeed ? Number(windspeed) : undefined,
          imageUrl: photos[0] || undefined,
          photos: photos,
        }),
      });

      if (response.ok) {
        router.push("/trips");
      } else {
        setError("Failed to save trip. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Log a Trip to {city}</h1>
      {temperature && (
        <p className="text-gray-400 mb-6 text-sm">Weather when logged: {temperature}°C, {windspeed} km/h wind</p>
      )}

      {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend getaway" className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white"/>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Visit Date &amp; Time</label>
          <input type="datetime-local" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white [color-scheme:dark]"/>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Pictures (select one or multiple)</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-blue-400 hover:file:bg-gray-700 cursor-pointer"/>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border border-gray-700 h-24 bg-black">
                  <img src={photo} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs cursor-pointer" title="Remove">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Trip Description / Notes</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Write about what you did, places you visited, food you tried..." className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white"/>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition">
          {submitting ? "Saving..." : "Save Trip"}
        </button>
      </div>
    </main>
  );
}

export default function NewTrip() {
  return (
    <Suspense fallback={<main className="max-w-lg mx-auto px-6 py-8 text-gray-400">Loading...</main>}>
      <NewTripForm />
    </Suspense>
  );
}