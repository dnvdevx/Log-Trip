import mongoose, { Schema, models, model } from "mongoose";

const TripSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  city: { type: String, required: true },
  country: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  visitDate: { type: Date },
  temperature: { type: Number },
  windspeed: { type: Number },
  imageUrl: { type: String },
  photos: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Trip = models.Trip || model("Trip", TripSchema);

export default Trip;