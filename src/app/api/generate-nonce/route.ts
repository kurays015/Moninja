// API Route: /api/generate-nonce/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const privy_token = (await cookies()).get("privy-token");
    const { sessionId, player, gameStartTime } = await request.json();

    if (!sessionId || !player || !privy_token) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the request is coming from an authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No valid session token provided" },
        { status: 401 }
      );
    }

    const sessionToken = authHeader.substring(7);
    try {
      const sessionData = jwt.verify(sessionToken, process.env.JWT_SECRET!) as {
        player: string;
        sessionId: string;
      };

      if (
        sessionData.player !== player ||
        sessionData.sessionId !== sessionId
      ) {
        return NextResponse.json(
          { message: "Session mismatch" },
          { status: 401 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid session token", err },
        { status: 401 }
      );
    }

    // Generate unique nonce
    const nonce = jwt.sign(
      {
        sessionId,
        player,
        timestamp: Date.now(),
        gameStartTime: gameStartTime || Date.now(),
        random:
          Math.random().toString(36).substring(7) + Date.now().toString(36),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" } // 5 minute expiry
    );

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json(
      { message: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}
