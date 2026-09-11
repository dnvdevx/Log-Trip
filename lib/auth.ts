import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "twl_super_secret_jwt_key_2024_xK9mPqR7";

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAuth(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get("token")?.value;
  if (!token) 
    return null;
  return verifyToken(token);
}