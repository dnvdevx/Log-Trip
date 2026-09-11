import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = getAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ userId: user.userId, name: user.name, email: user.email });
}