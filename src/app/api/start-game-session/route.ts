import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createGameSession, encryptSessionCookie } from "@/src/lib/sessions";
import arcjet, { slidingWindow, tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Primary rule: Allow quick restarts for fast game overs
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"], // Rate limit per user
      refillRate: 12, // Refill 12 tokens per interval (1 every 5 seconds)
      interval: 60, // Refill every minute
      capacity: 20, // Allow burst of 20 quick restarts
    }),
    // Prevent only truly rapid spam (sub-second clicks)
    slidingWindow({
      mode: "LIVE",
      interval: 3, // 3 second window
      max: 3, // Max 3 requests in 3 seconds (prevents accidental double-clicks)
    }),
    // Reasonable per-minute limit for legitimate gameplay
    slidingWindow({
      mode: "LIVE",
      interval: 60, // 1 minute window
      max: 15, // Up to 15 games per minute (4-second average per game)
    }),
    // IP-based protection against distributed attacks
    slidingWindow({
      mode: "LIVE",
      interval: 60, // 1 minute window
      max: 3, // Max 3 requests per minute per IP
    }),
    // Long-term protection against sustained abuse
    slidingWindow({
      mode: "LIVE",
      interval: 3600, // 1 hour window
      max: 200, // Max 200 game sessions per hour (reasonable for addictive gameplay)
    }),
  ],
});

export async function POST(request: Request) {
  try {
    const privy_token = (await cookies()).get("privy-token");
    const { walletAddress } = await request.json();

    if (!walletAddress || !privy_token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 400 }
      );
    }

    const decision = await aj.protect(request, {
      userId: privy_token.value,
      requested: 1,
    });

    if (decision.isDenied()) {
      //rate limited
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too Many Requests" },
          { status: 429 }
        );
        //bot
      } else if (decision.reason.isBot()) {
        return NextResponse.json({ error: "No bots allowed" }, { status: 403 });
        //others
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Create session server-side only - no tokens returned to client
    const session = await createGameSession(walletAddress, privy_token.value);
    // Create encrypted HTTP-only cookie
    const sessionCookie = await encryptSessionCookie({
      sessionId: session.sessionId,
      playerId: walletAddress,
    });

    const response = NextResponse.json({
      success: true,
    });

    // Set HTTP-only cookie - invisible to client JavaScript
    response.cookies.set("game_session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Error creating game session:", error);
    return NextResponse.json(
      { message: "Failed to create game session" },
      { status: 500 }
    );
  }
}
