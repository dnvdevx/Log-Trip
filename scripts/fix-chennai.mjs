import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
const envFile = readFileSync(envPath, "utf-8");
envFile.split("\n").forEach((line) => {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (key) process.env[key] = val;
  }
});

const MONGODB_URI = process.env.MONGODB_URI;

const TripSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  city: String, country: String, title: String, description: String,
  visitDate: Date, temperature: Number, windspeed: Number, createdAt: Date,
});
const Trip = mongoose.models.Trip || mongoose.model("Trip", TripSchema);

await mongoose.connect(MONGODB_URI);

const trip = await Trip.findOne({ city: { $regex: /chennai/i }, visitDate: null });

if (!trip) {
  console.log("Chennai entry not found or already has a visit date.");
} else {
  await Trip.findByIdAndUpdate(trip._id, {
    title: "Weekend in Chennai",
    description: "Explored Marina Beach, tried authentic filter coffee, and visited Kapaleeshwarar Temple. Hot and humid but worth every minute.",
    visitDate: new Date("2024-12-15"),
    country: "India",
  });
  console.log("Chennai trip updated successfully!");
}

await mongoose.disconnect();
