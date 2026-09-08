import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;

const encodedSecret = new TextEncoder().encode(
  JWT_SECRET || "dev-fallback-secret-do-not-use-in-prod"
);

if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Set it in your .env file.");
}

export type TokenPayload = {
  userId: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
};

export async function signToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedSecret);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);

    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromRequest(
  req: NextRequest
): Promise<TokenPayload | null> {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  return verifyToken(token);
}