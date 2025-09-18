import { getSessionFromRequest } from "@/src/lib/getSessionFromRequest";
import { redis } from "@/src/lib/nonceStore"; // Import your redis instance
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getSessionFromRequest();

    if (!session) {
      return NextResponse.json(
        { message: "No active session found" },
        { status: 401 }
      );
    }

    // Instead of ending immediately, set TTL to 10 seconds
    await redis.expire(`session:${session.sessionId}`, 10);

    const response = NextResponse.json({ success: true });

    // Clear the session cookie immediately (so frontend knows it's ended)
    response.cookies.delete("game_session");

    console.log(`⏳ Session ${session.sessionId} will expire in 10 seconds`);

    return response;
  } catch (error) {
    console.error("Error ending session:", error);
    return NextResponse.json(
      { message: "Failed to end session" },
      { status: 500 }
    );
  }
}
