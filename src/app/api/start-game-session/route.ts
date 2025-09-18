import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createGameSession, encryptSessionCookie } from "@/src/lib/sessions";

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

    // Create session server-side only - no tokens returned to client
    const session = await createGameSession(walletAddress, privy_token.value);

    // Create encrypted HTTP-only cookie
    const sessionCookie = await encryptSessionCookie({
      sessionId: session.sessionId,
      playerId: walletAddress,
    });

    const response = NextResponse.json({
      success: true,
      gameTime: session.startTime,
      // Remove sessionToken and sessionId from response
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
