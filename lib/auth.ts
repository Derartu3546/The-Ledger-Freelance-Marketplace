import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

// jose (not jsonwebtoken) is required here because this file is imported by
// middleware.ts, which runs on Next.js's Edge Runtime — Edge has no access to
// Node's `crypto` module, which jsonwebtoken depends on. jose uses the Web
// Crypto API instead, so the exact same code works in both middleware (edge)
// and API routes (Node.js).
const JWT_SECRET = process.env.JWT_SECRET as string;
const encodedSecret = new TextEncoder().encode(JWT_SECRET || "dev-fallback-secret-do-not-use-in-prod");

if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Set it in your .env file.");
}

export type TokenPayload = {
  userId: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
};

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/** Reads the JWT from the `token` cookie on an incoming API request. */
export async function getAuthFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
