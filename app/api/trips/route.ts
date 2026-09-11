import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trip from "@/models/Trip";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await dbConnect();
  const user = getAuth(request);

  // If logged in, only return that user trips. Otherwise return all (demo fallback).
  const filter = user ? { userId: user.userId } : {};
  const trips = await Trip.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(trips);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const user = getAuth(request);
  const body = await request.json();

  const trip = await Trip.create({
    ...body,
    userId: user ? user.userId : undefined,
  });
  return NextResponse.json(trip, { status: 201 });
}