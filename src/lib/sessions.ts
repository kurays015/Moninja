import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import { redis } from "./nonceStore";
import { GameSession } from "../types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createGameSession(
  walletAddress: string,
  privy_token: string
): Promise<GameSession> {
  const sessionId = randomUUID();

  const session: GameSession = {
    sessionId,
    player: walletAddress,
    privy_token,
    startTime: Date.now(),
    isActive: true,
  };

  // Save to Redis with TTL (e.g. 1h)
  await redis.set(`session:${sessionId}`, JSON.stringify(session), {
    ex: 3600,
  });

  return session;
}

export async function getActiveSession(
  sessionId: string
): Promise<GameSession | null> {
  const data = await redis.get(`session:${sessionId}`);
  console.log(data, " DATAA");
  if (!data) return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as GameSession;
    } catch (e) {
      console.error("Failed to parse session JSON from Redis", e);
      return null;
    }
  }
  if (typeof data === "object") {
    return data as GameSession;
  }
  return null;
}

export async function endSession(sessionId: string): Promise<boolean> {
  const deleted = await redis.del(`session:${sessionId}`);
  return deleted > 0;
}

export async function encryptSessionCookie(sessionData: {
  sessionId: string;
  playerId: string;
}): Promise<string> {
  const jwt = await new SignJWT({
    sessionId: sessionData.sessionId,
    playerId: sessionData.playerId,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(JWT_SECRET);

  return jwt;
}

export async function decryptSessionCookie(cookieValue: string): Promise<{
  sessionId: string;
  playerId: string;
} | null> {
  try {
    const { payload } = await jwtVerify(cookieValue, JWT_SECRET);
    return {
      sessionId: payload.sessionId as string,
      playerId: payload.playerId as string,
    };
  } catch {
    return null;
  }
}
