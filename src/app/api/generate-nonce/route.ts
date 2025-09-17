// API Route: /api/generate-nonce/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getSessionFromRequest } from "@/src/lib/getSessionFromRequest";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest();
    console.log(session, "nonce!");

    if (!session || !session.isActive) {
      return NextResponse.json(
        { message: "No active game session" },
        { status: 401 }
      );
    }

    const { player, gameStartTime } = await request.json();

    if (!player) {
      return NextResponse.json(
        { message: "Missing required parameter: player" },
        { status: 400 }
      );
    }

    if (player.toLowerCase() !== session.player.toLowerCase()) {
      return NextResponse.json(
        { message: "Player does not match active session" },
        { status: 401 }
      );
    }

    // Generate unique, short-lived nonce bound to the active session
    const nonce = jwt.sign(
      {
        sessionId: session.sessionId,
        player: session.player,
        timestamp: Date.now(),
        gameStartTime: gameStartTime || session.startTime,
        random:
          Math.random().toString(36).substring(7) + Date.now().toString(36),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
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
